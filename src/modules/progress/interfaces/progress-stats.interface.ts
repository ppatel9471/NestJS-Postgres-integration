export interface ProgressStats {
    totalLessonsStarted: number;
    completedLessons: number;
    totalStepsCompleted: number;
    averageScore: number;
    averageTimePerLesson: number;
    lastAccessed?: Date;
    weeklyProgress: {
      date: string;
      completedSteps: number;
      timeSpent: number;
    }[];
    topicsProgress: {
      topicId: number;
      topicName: string;
      progress: number;
      completedLessons: number;
      totalLessons: number;
    }[];
  }