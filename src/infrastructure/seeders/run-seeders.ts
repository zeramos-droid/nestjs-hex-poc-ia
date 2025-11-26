import { AppDataSource } from '../config/typeorm.config';
import { ProductSeeder } from './product.seeder';

async function runSeeders() {
  try {
    console.log('🌱 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('\n🌱 Running seeders...\n');

    await ProductSeeder.run(AppDataSource);

    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
}

runSeeders();
