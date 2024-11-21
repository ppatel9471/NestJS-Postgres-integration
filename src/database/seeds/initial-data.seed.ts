import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Topic } from '../../modules/topics/entities/topic.entity';
import { LearningStep } from '../../modules/learning/entities/learning-step.entity';
import { Lesson } from '../../modules/learning/entities/lesson.entity';

export class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    try {
      // Get repositories
      const topicRepository = connection.getRepository(Topic);
      const lessonRepository = connection.getRepository(Lesson);
      const learningStepRepository = connection.getRepository(LearningStep);

      // Create Topics
      const additionTopic = await topicRepository.save({
        name: 'Addition',
        icon: 'Plus',
        description: 'Learn the basics of addition with interactive lessons and practice exercises',
        level: 1,
      });

      const subtractionTopic = await topicRepository.save({
        name: 'Subtraction',
        icon: 'Minus',
        description: 'Master the art of subtraction through engaging content and exercises',
        level: 1,
      });

      const multiplicationTopic = await topicRepository.save({
        name: 'Multiplication',
        icon: 'X',
        description: 'Discover multiplication concepts with fun and interactive lessons',
        level: 2,
      });

      // Create Lessons for Addition Topic
      const additionLesson1 = await lessonRepository.save({
        title: 'Introduction to Addition',
        description: 'Learn the basics of adding numbers together',
        difficulty: 'beginner',
        topic: additionTopic,
        order: 1,
      });

      const additionLesson2 = await lessonRepository.save({
        title: 'Adding Single Digits',
        description: 'Practice adding numbers from 0 to 9',
        difficulty: 'beginner',
        topic: additionTopic,
        order: 2,
      });

      // Create Learning Steps for Addition Lesson 1
      await learningStepRepository.save([
        {
          title: 'Understanding Addition',
          type: 'video',
          content: {
            videoUrl: '/videos/addition-intro.mp4',
            transcript: "In this lesson, we'll learn about addition...",
            duration: 300, // 5 minutes
          },
          lesson: additionLesson1,
          order: 1,
        },
        {
          title: 'Addition Explanation',
          type: 'explanation',
          content: {
            sections: [
              {
                title: 'What is Addition?',
                text: 'Addition is the process of combining numbers to find their total...',
                examples: [
                  { question: '2 + 3 = ?', answer: '5', explanation: 'When we add 2 and 3, we get 5' }
                ]
              }
            ]
          },
          lesson: additionLesson1,
          order: 2,
        },
        {
          title: 'Practice Time',
          type: 'quiz',
          content: {
            questions: [
              {
                type: 'multiple-choice',
                question: 'What is 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 1,
                explanation: 'Two plus two equals four'
              }
            ]
          },
          lesson: additionLesson1,
          order: 3,
        }
      ]);

      // Log success message
      console.log('Initial seed data has been inserted');
      
    } catch (error) {
      console.error('Error seeding data:', error);
      throw error;
    }
  }
}
