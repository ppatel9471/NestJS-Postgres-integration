
import { CreateInitialData } from './initial-data.seed';
import { createConnection } from 'typeorm';
import { runSeeder } from 'typeorm-seeding';

async function runSeeds() {
  const connection = await createConnection();
  try {
    await runSeeder(CreateInitialData);
    console.log('Seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    throw error;
  } finally {
    await connection.close();
  }
}

runSeeds().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});