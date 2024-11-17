export interface Achievement {
    id: string;
    name: string;
    description: string;
    earned: boolean;
    progress: number;
    earnedDate?: Date;
    icon?: string;
  }