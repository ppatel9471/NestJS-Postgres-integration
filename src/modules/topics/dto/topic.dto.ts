import { IsString, IsNumber, IsOptional } from 'class-validator';

export class TopicFilterDto {
  @IsOptional()
  @IsNumber()
  level?: number;
}