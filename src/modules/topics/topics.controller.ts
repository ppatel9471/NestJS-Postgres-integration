import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TopicsService } from './topics.service';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('level') level?: number
  ) {
    return this.topicsService.findAll(level, req.user.userId);
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.topicsService.findOne(+id, req.user.userId);
  }

  @Get(':id/lessons')
  async getLessons(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.topicsService.getLessons(+id, req.user.userId);
  }

  @Get(':id/progress')
  async getTopicProgress(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.topicsService.getTopicProgress(+id, req.user.userId);
  }
}