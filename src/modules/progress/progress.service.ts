import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { CreateProgressDto, UpdateProgressDto } from './dto/progress.dto';
import { Achievement } from './interfaces/achievement.interface';
import { ProgressStats } from './interfaces/progress-stats.interface';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {}

  async updateProgress(
    userId: number,
    lessonId: number,
    stepId: number,
    updateDto: UpdateProgressDto
  ) {
    let progress = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lessonId },
      },
    });

    if (!progress) {
      // Create new progress entity
      const newProgress = this.progressRepository.create({
        user: { id: userId },
        lesson: { id: lessonId },
        completedSteps: [stepId],
        metadata: updateDto.metadata || {},
      });
      
      progress = await this.progressRepository.save(newProgress);
    } else {
      // Update existing progress
      if (!progress.completedSteps.includes(stepId)) {
        progress.completedSteps = [...progress.completedSteps, stepId];
      }

      if (updateDto.metadata) {
        progress.metadata = {
          ...progress.metadata,
          ...updateDto.metadata,
        };
      }

      progress = await this.progressRepository.save({
        ...progress,
        lastAccessed: new Date(),
      });
    }

    return progress;
  }

  async getUserProgress(userId: number): Promise<Progress[]> {
    return this.progressRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['lesson', 'lesson.topic'],
    });
  }

  async getLessonProgress(userId: number, lessonId: number) {
    const progress = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lessonId },
      },
      relations: ['lesson', 'lesson.steps'],
    });

    if (!progress) {
      // Create initial progress record
      const newProgress = this.progressRepository.create({
        user: { id: userId },
        lesson: { id: lessonId },
        completedSteps: [],
        metadata: {},
      });

      await this.progressRepository.save(newProgress);
      
      return {
        completed: false,
        completedSteps: [],
        totalSteps: 0,
        progress: 0,
      };
    }

    const totalSteps = progress.lesson.steps.length;
    const completedStepsCount = progress.completedSteps.length;

    return {
      completed: completedStepsCount === totalSteps,
      completedSteps: progress.completedSteps,
      totalSteps,
      progress: Math.round((completedStepsCount / totalSteps) * 100),
      metadata: progress.metadata,
    };
  }

  async getWeeklyProgress(userId: number, startDate: Date) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const progressEntries = await this.progressRepository.find({
      where: {
        user: { id: userId },
        lastAccessed: Between(startDate, endDate),
      },
      relations: ['lesson'],
      order: {
        lastAccessed: 'ASC',
      },
    });

    const dailyProgress = progressEntries.reduce((acc, entry) => {
      const date = entry.lastAccessed.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          completedSteps: 0,
          timeSpent: 0,
        };
      }
      acc[date].completedSteps += entry.completedSteps.length;
      acc[date].timeSpent += entry.metadata?.timeSpent || 0;
      return acc;
    }, {} as Record<string, { date: string; completedSteps: number; timeSpent: number }>);

    return Object.values(dailyProgress);
  }

  async createProgress(createDto: CreateProgressDto): Promise<Progress> {
    const progress = this.progressRepository.create({
      user: { id: createDto.userId },
      lesson: { id: createDto.lessonId },
      completedSteps: createDto.completedSteps || [],
      metadata: createDto.metadata || {},
    });

    return this.progressRepository.save(progress);
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    const progress = await this.getUserProgress(userId);
    const achievements: Achievement[] = [];

    // Speed Demon Achievement
    const speedDemonProgress = this.calculateSpeedDemonProgress(progress);
    achievements.push({
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete 10 exercises under 5 minutes',
      earned: speedDemonProgress >= 100,
      progress: speedDemonProgress,
      icon: 'Zap',
      earnedDate: this.getAchievementEarnedDate(progress, 'speed_demon')
    });

    // Perfect Score Achievement
    const perfectScoreProgress = this.calculatePerfectScoreProgress(progress);
    achievements.push({
      id: 'perfect_score',
      name: 'Perfect Score',
      description: 'Get 100% on 5 different exercises',
      earned: perfectScoreProgress >= 100,
      progress: perfectScoreProgress,
      icon: 'Target',
      earnedDate: this.getAchievementEarnedDate(progress, 'perfect_score')
    });

    // Learning Streak Achievement
    const streakProgress = await this.calculateStreakProgress(userId);
    achievements.push({
      id: 'learning_streak',
      name: 'Learning Streak',
      description: 'Complete exercises 7 days in a row',
      earned: streakProgress >= 100,
      progress: streakProgress,
      icon: 'Flame',
      earnedDate: this.getAchievementEarnedDate(progress, 'learning_streak')
    });

    // Topic Master Achievement
    const topicMasterProgress = this.calculateTopicMasterProgress(progress);
    achievements.push({
      id: 'topic_master',
      name: 'Topic Master',
      description: 'Complete all exercises in a topic',
      earned: topicMasterProgress >= 100,
      progress: topicMasterProgress,
      icon: 'Award',
      earnedDate: this.getAchievementEarnedDate(progress, 'topic_master')
    });

    return achievements;
  }

  private calculateSpeedDemonProgress(progress: Progress[]): number {
    const fastExercises = progress.filter(p => {
      const timeSpent = p.metadata?.timeSpent || 0;
      return timeSpent > 0 && timeSpent < 300; // Less than 5 minutes
    }).length;

    return Math.min((fastExercises / 10) * 100, 100);
  }

  private calculatePerfectScoreProgress(progress: Progress[]): number {
    const perfectScores = progress.filter(p => 
      p.metadata?.score === 100
    ).length;

    return Math.min((perfectScores / 5) * 100, 100);
  }

  private async calculateStreakProgress(userId: number): Promise<number> {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProgress = await this.progressRepository.find({
      where: {
        user: { id: userId },
        lastAccessed: Between(sevenDaysAgo, today)
      },
      order: {
        lastAccessed: 'ASC'
      }
    });

    if (!recentProgress.length) return 0;

    let currentStreak = 1;
    let maxStreak = 1;
    let previousDate = new Date(recentProgress[0].lastAccessed).toDateString();

    for (let i = 1; i < recentProgress.length; i++) {
      const currentDate = new Date(recentProgress[i].lastAccessed).toDateString();
      if (currentDate === previousDate) continue;

      const dayDiff = Math.abs(
        (new Date(currentDate).getTime() - new Date(previousDate).getTime()) 
        / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }

      previousDate = currentDate;
    }

    return Math.min((maxStreak / 7) * 100, 100);
  }

  private calculateTopicMasterProgress(progress: Progress[]): number {
    // Group progress by topic
    const topicProgress = progress.reduce((acc, curr) => {
      const topicId = curr.lesson.topic.id;
      if (!acc[topicId]) {
        acc[topicId] = {
          totalLessons: 0,
          completedLessons: 0
        };
      }

      acc[topicId].totalLessons++;
      if (curr.completedSteps.length === curr.lesson.steps.length) {
        acc[topicId].completedLessons++;
      }

      return acc;
    }, {} as Record<number, { totalLessons: number; completedLessons: number }>);

    // Check if any topic is completed
    const completedTopics = Object.values(topicProgress).filter(
      topic => topic.completedLessons === topic.totalLessons && topic.totalLessons > 0
    ).length;

    return completedTopics > 0 ? 100 : 0;
  }

  private getAchievementEarnedDate(progress: Progress[], achievementId: string): Date | undefined {
    switch (achievementId) {
      case 'speed_demon':
        const fastExercises = progress.filter(p => 
          p.metadata?.timeSpent && p.metadata.timeSpent < 300
        );
        return fastExercises.length >= 10 ? 
          fastExercises[9].lastAccessed : undefined;

      case 'perfect_score':
        const perfectScores = progress.filter(p => 
          p.metadata?.score === 100
        );
        return perfectScores.length >= 5 ? 
          perfectScores[4].lastAccessed : undefined;

      // Add more achievement date calculations as needed
      default:
        return undefined;
    }
  }

  async updateAchievementProgress(
    userId: number, 
    lessonProgress: Progress
  ): Promise<Achievement[]> {
    // This method can be called after updating progress to check and award new achievements
    const achievements = await this.getUserAchievements(userId);
    
    // Here you could implement logic to notify the user of newly earned achievements
    // You could also store achievement data in a separate table if needed
    
    return achievements.filter(a => a.earned);
  }

  async getProgressStats(userId: number): Promise<ProgressStats> {
    const progress = await this.progressRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['lesson', 'lesson.topic', 'lesson.steps'],
      order: {
        lastAccessed: 'DESC',
      },
    });

    // Calculate total lessons started and completed
    const totalLessonsStarted = progress.length;
    const completedLessons = progress.filter(p => 
      p.completedSteps.length === p.lesson.steps.length
    ).length;

    // Calculate total steps completed
    const totalStepsCompleted = progress.reduce(
      (sum, p) => sum + p.completedSteps.length, 
      0
    );

    // Calculate average score
    const scoresSum = progress.reduce(
      (sum, p) => sum + (p.metadata?.score || 0), 
      0
    );
    const averageScore = totalLessonsStarted > 0 
      ? Math.round(scoresSum / totalLessonsStarted) 
      : 0;

    // Calculate average time per lesson (in minutes)
    const totalTime = progress.reduce(
      (sum, p) => sum + (p.metadata?.timeSpent || 0), 
      0
    );
    const averageTimePerLesson = totalLessonsStarted > 0 
      ? Math.round(totalTime / totalLessonsStarted / 60) 
      : 0;

    // Get last accessed date
    const lastAccessed = progress.length > 0 
      ? progress[0].lastAccessed 
      : undefined;

    // Calculate weekly progress
    const weeklyProgress = await this.getWeeklyProgress(
      userId,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    // Calculate progress by topic
    const topicsProgress = this.calculateTopicsProgress(progress);

    return {
      totalLessonsStarted,
      completedLessons,
      totalStepsCompleted,
      averageScore,
      averageTimePerLesson,
      lastAccessed,
      weeklyProgress,
      topicsProgress,
    };
  }

  private calculateTopicsProgress(progress: Progress[]): {
    topicId: number;
    topicName: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
  }[] {
    // Group progress by topic
    const topicMap = progress.reduce((map, p) => {
      const topic = p.lesson.topic;
      if (!map.has(topic.id)) {
        map.set(topic.id, {
          topicId: topic.id,
          topicName: topic.name,
          completedLessons: 0,
          totalLessons: 0,
          totalSteps: 0,
          completedSteps: 0,
        });
      }

      const topicStats = map.get(topic.id)!;
      topicStats.totalLessons++;
      topicStats.totalSteps += p.lesson.steps.length;
      topicStats.completedSteps += p.completedSteps.length;

      if (p.completedSteps.length === p.lesson.steps.length) {
        topicStats.completedLessons++;
      }

      return map;
    }, new Map());

    // Calculate progress for each topic
    return Array.from(topicMap.values()).map(stats => ({
      topicId: stats.topicId,
      topicName: stats.topicName,
      progress: Math.round((stats.completedSteps / stats.totalSteps) * 100),
      completedLessons: stats.completedLessons,
      totalLessons: stats.totalLessons,
    }));
  }

  // Add a method to get detailed lesson stats
  async getLessonStats(userId: number, lessonId: number) {
    const progress = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lessonId },
      },
      relations: ['lesson', 'lesson.steps'],
    });

    if (!progress) {
      return {
        completed: false,
        progress: 0,
        timeSpent: 0,
        score: 0,
        attempts: 0,
      };
    }

    return {
      completed: progress.completedSteps.length === progress.lesson.steps.length,
      progress: Math.round(
        (progress.completedSteps.length / progress.lesson.steps.length) * 100
      ),
      timeSpent: progress.metadata?.timeSpent || 0,
      score: progress.metadata?.score || 0,
      attempts: progress.metadata?.attempts || 0,
      lastAttempt: progress.lastAccessed,
    };
  }

  // Add a method to get time-based statistics
  async getTimeBasedStats(userId: number, startDate: Date, endDate: Date) {
    const progress = await this.progressRepository.find({
      where: {
        user: { id: userId },
        lastAccessed: Between(startDate, endDate),
      },
      relations: ['lesson', 'lesson.steps'],
      order: {
        lastAccessed: 'ASC',
      },
    });

    return {
      totalTimeSpent: progress.reduce(
        (sum, p) => sum + (p.metadata?.timeSpent || 0), 
        0
      ),
      lessonsCompleted: progress.filter(
        p => p.completedSteps.length === p.lesson.steps.length
      ).length,
      stepsCompleted: progress.reduce(
        (sum, p) => sum + p.completedSteps.length, 
        0
      ),
      averageScore: progress.length > 0
        ? Math.round(
            progress.reduce((sum, p) => sum + (p.metadata?.score || 0), 0) / 
            progress.length
          )
        : 0,
    };
  }
}