import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Lesson } from '../../learning/entities/lesson.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column('text')
  description: string;

  @Column({ default: 1 })
  level: number;

  @OneToMany(() => Lesson, lesson => lesson.topic)
  lessons: Lesson[];
}