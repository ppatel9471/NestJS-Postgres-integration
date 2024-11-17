import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { LearningStep } from './learning-step.entity';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  difficulty: string;

  @ManyToOne(() => Topic, topic => topic.lessons)
  topic: Topic;

  @OneToMany(() => LearningStep, step => step.lesson)
  steps: LearningStep[];
}