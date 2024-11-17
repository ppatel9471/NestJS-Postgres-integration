import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { LearningStep } from './entities/learning-step.entity';
import { ProgressService } from '../progress/progress.service';
import { UpdateProgressDto } from '../progress/dto/progress.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(LearningStep)
    private stepRepository: Repository<LearningStep>,
    private progressService: ProgressService,
  ) {}

  async getLesson(id: number) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['steps', 'topic'],
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async getStep(stepId: number) {
    const step = await this.stepRepository.findOne({
      where: { id: stepId },
      relations: ['lesson'],
    });
    if (!step) {
      throw new NotFoundException('Step not found');
    }
    return step;
  }

  async completeStep(userId: number, lessonId: number, stepId: number) {
    // Create update DTO with default values
    const updateDto: UpdateProgressDto = {
      completedSteps: [stepId],
      metadata: {
        lastCompletedAt: new Date(),
        timeSpent: 0, // You can calculate actual time spent if needed
      }
    };

    return this.progressService.updateProgress(userId, lessonId, stepId, updateDto);
  }

  async validateStepAnswer(stepId: number, answer: any) {
    const step = await this.getStep(stepId);
    if (step.type !== 'quiz') {
      throw new Error('This step does not require validation');
    }

    // Implement answer validation logic based on step content
    const isCorrect = this.validateAnswer(step.content, answer);
    return { isCorrect };
  }

  private validateAnswer(content: any, answer: any): boolean {
    // Implement specific validation logic based on question type
    switch (content.type) {
      case 'multiple-choice':
        return content.correctAnswer === answer;
      case 'numeric':
        return Number(content.correctAnswer) === Number(answer);
      default:
        return false;
    }
  }
}