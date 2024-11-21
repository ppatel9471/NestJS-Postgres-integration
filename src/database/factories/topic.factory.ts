import { Topic } from '../../modules/topics/entities/topic.entity';
import { define } from 'typeorm-seeding';

define(Topic, (faker) => {
  const topic = new Topic();
  topic.name = faker.random.arrayElement(['Addition', 'Subtraction', 'Multiplication', 'Division']);
  topic.icon = faker.random.arrayElement(['Plus', 'Minus', 'X', 'Divide']);
  topic.description = faker.lorem.paragraph();
  topic.level = faker.random.number({ min: 1, max: 5 });
  return topic;
});