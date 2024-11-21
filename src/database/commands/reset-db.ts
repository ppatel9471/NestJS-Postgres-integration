import { AppDataSource } from "../../data-source";


async function resetDatabase() {
  try {
    // Initialize the connection
    await AppDataSource.initialize();
    
    // Drop the database
    await AppDataSource.dropDatabase();
    
    // Run migrations
    await AppDataSource.runMigrations();
    
    console.log('Database reset successful');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    // Close the connection
    await AppDataSource.destroy();
  }
}

resetDatabase();