import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Progress } from '../../progress/entities/progress.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 1 })
  level: number;

  @OneToMany(() => Progress, progress => progress.user)
  progress: Progress[];
}