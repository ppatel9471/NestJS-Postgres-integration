import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity()
export class LearningStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column('json')
  content: any;

  @ManyToOne(() => Lesson, lesson => lesson.steps)
  lesson: Lesson;
}