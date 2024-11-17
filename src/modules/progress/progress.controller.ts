import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { CreateProgressDto, UpdateProgressDto } from './dto/progress.dto';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getUserProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.userId);
  }

  @Get('stats')
  async getProgressStats(@Request() req) {
    return this.progressService.getProgressStats(req.user.userId);
  }

  @Get('lessons/:lessonId')
  async getLessonProgress(@Request() req, @Param('lessonId') lessonId: string) {
    return this.progressService.getLessonProgress(req.user.userId, +lessonId);
  }

  @Post('lessons/:lessonId/steps/:stepId')
  async updateStepProgress(
    @Request() req,
    @Param('lessonId') lessonId: string,
    @Param('stepId') stepId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.updateProgress(
      req.user.userId,
      +lessonId,
      +stepId,
      updateProgressDto,
    );
  }

  @Get('achievements')
  async getUserAchievements(@Request() req) {
    return this.progressService.getUserAchievements(req.user.userId);
  }

  @Get('weekly')
  async getWeeklyProgress(
    @Request() req,
    @Query('startDate') startDate: string,
  ) {
    return this.progressService.getWeeklyProgress(
      req.user.userId,
      new Date(startDate),
    );
  }
}
