import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../learning/entities/lesson.entity';

@Entity()
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.progress)
  user: User;

  @ManyToOne(() => Lesson)
  lesson: Lesson;

  @Column('simple-array')
  completedSteps: number[];

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastAccessed: Date;
}