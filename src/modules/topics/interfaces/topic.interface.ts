import { Topic } from "../entities/topic.entity";

export interface TopicWithProgress extends Topic {
    progress?: number;
  }