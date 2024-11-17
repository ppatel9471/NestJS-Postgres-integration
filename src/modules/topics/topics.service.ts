import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { Progress } from '../progress/entities/progress.entity';
import { TopicProgress } from './interfaces/topic-progress.interface';
import { TopicWithProgress } from './interfaces/topic.interface';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
  ) {}

  async findAll(level?: number, userId?: number): Promise<TopicWithProgress[]> {
    const query = this.topicsRepository.createQueryBuilder('topic')
      .leftJoinAndSelect('topic.lessons', 'lessons');

    if (level) {
      query.where('topic.level = :level', { level });
    }

    const topics = await query.getMany();

    // If userId is provided, include progress information
    if (userId) {
      const progress = await this.progressRepository.find({
        where: { user: { id: userId } },
        relations: ['lesson', 'lesson.topic'],
      });

      return topics.map(topic => ({
        ...topic,
        progress: this.calculateTopicProgress(topic, progress),
      }));
    }

    return topics;
  }

  async findOne(id: number, userId?: number): Promise<TopicWithProgress> {
    const topic = await this.topicsRepository.findOne({
      where: { id },
      relations: ['lessons', 'lessons.steps'],
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID "${id}" not found`);
    }

    // If userId is provided, include progress information
    if (userId) {
      const progress = await this.progressRepository.find({
        where: {
          user: { id: userId },
          lesson: { topic: { id } },
        },
        relations: ['lesson'],
      });

      return {
        ...topic,
        progress: this.calculateTopicProgress(topic, progress),
      };
    }

    return topic;
  }

  async getLessons(topicId: number, userId: number) {
    const topic = await this.findOne(topicId, userId);
    const progress = await this.progressRepository.find({
      where: {
        user: { id: userId },
        lesson: { topic: { id: topicId } },
      },
      relations: ['lesson'],
    });

    return topic.lessons.map(lesson => ({
      ...lesson,
      progress: this.calculateLessonProgress(lesson, progress),
    }));
  }

  // Update the getTopicProgress call in your method
  private calculateTopicProgress(topic: Topic, progress: Progress[]): number {
    const totalSteps = topic.lessons.reduce(
      (sum, lesson) => sum + (lesson.steps?.length || 0),
      0
    );

    const completedSteps = progress.reduce(
      (sum, p) => sum + (p.completedSteps?.length || 0),
      0
    );

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }

  private calculateLessonProgress(lesson: any, progress: Progress[]): number {
    const lessonProgress = progress.find(p => p.lesson.id === lesson.id);
    if (!lessonProgress || !lesson.steps) return 0;

    return Math.round((lessonProgress.completedSteps.length / lesson.steps.length) * 100);
  }

  async getTopicProgress(topicId: number, userId: number): Promise<TopicProgress> {
    const topic = await this.findOne(topicId, userId);

    const progress = await this.progressRepository.find({
      where: {
        user: { id: userId },
        lesson: { topic: { id: topicId } },
      },
      relations: ['lesson'],
      order: {
        lastAccessed: 'DESC',
      },
    });

    const totalSteps = topic.lessons.reduce(
      (sum, lesson) => sum + (lesson.steps?.length || 0),
      0
    );

    const completedSteps = progress.reduce(
      (sum, p) => sum + (p.completedSteps?.length || 0),
      0
    );

    const lessonsProgress = topic.lessons.map(lesson => {
      const lessonProgress = progress.find(p => p.lesson.id === lesson.id);
      const completed = lessonProgress?.completedSteps.length === lesson.steps?.length;

      return {
        id: lesson.id,
        title: lesson.title,
        progress: this.calculateLessonProgress(lesson, progress),
        completed,
        lastAccessed: lessonProgress?.lastAccessed,
      };
    });

    return {
      id: topic.id,
      name: topic.name,
      totalLessons: topic.lessons.length,
      completedLessons: lessonsProgress.filter(l => l.completed).length,
      totalSteps,
      completedSteps,
      progress: topic.progress || 0,
      lastAccessed: progress.length > 0 ? progress[0].lastAccessed : undefined,
      lessonsProgress,
    };
  }
}