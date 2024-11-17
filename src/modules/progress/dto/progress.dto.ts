import { IsNumber, IsObject, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgressDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  lessonId: number;

  @IsArray()
  @IsOptional()
  completedSteps?: number[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateProgressDto {
  @IsArray()
  @IsOptional()
  completedSteps?: number[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}