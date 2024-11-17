import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(userData: any): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user[0]);
  }

  async updateLevel(userId: number, newLevel: number): Promise<User> {
    const user = await this.findById(userId);
    user.level = newLevel;
    return this.usersRepository.save(user);
  }
}