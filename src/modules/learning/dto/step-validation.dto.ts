import { IsNotEmpty } from 'class-validator';

export class StepValidationDto {
  @IsNotEmpty()
  answer: any;
}