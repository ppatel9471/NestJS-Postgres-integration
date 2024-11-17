import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress } from './entities/progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Progress])],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}