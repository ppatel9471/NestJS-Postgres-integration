export interface TopicProgress {
    id: number;
    name: string;
    totalLessons: number;
    completedLessons: number;
    totalSteps: number;
    completedSteps: number;
    progress: number;
    lastAccessed?: Date;
    lessonsProgress: {
      id: number;
      title: string;
      progress: number;
      completed: boolean;
      lastAccessed?: Date;
    }[];
  }