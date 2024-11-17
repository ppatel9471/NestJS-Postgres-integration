import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { Lesson } from './entities/lesson.entity';
import { LearningStep } from './entities/learning-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LearningStep])],
  providers: [LearningService],
  controllers: [LearningController],
})
export class LearningModule {}