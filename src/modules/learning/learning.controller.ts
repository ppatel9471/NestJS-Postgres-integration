import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LearningService } from './learning.service';
import { StepValidationDto } from './dto/step-validation.dto';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private learningService: LearningService) {}

  @Get('lessons/:id')
  getLesson(@Param('id') id: string) {
    return this.learningService.getLesson(+id);
  }

  @Get('steps/:id')
  getStep(@Param('id') id: string) {
    return this.learningService.getStep(+id);
  }

  @Post('steps/:id/validate')
  validateStep(
    @Param('id') id: string,
    @Body() validationDto: StepValidationDto,
  ) {
    return this.learningService.validateStepAnswer(+id, validationDto.answer);
  }

  @Post('steps/:id/complete')
  completeStep(
    @Request() req,
    @Param('id') stepId: string,
  ) {
    return this.learningService.completeStep(
      req.user.userId,
      req.body.lessonId,
      +stepId,
    );
  }
}