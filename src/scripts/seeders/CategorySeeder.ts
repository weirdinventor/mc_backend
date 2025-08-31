import { v4 as uuidv4 } from 'uuid';
import { EntityManager } from 'typeorm';
import { Identifiers } from '../../core/Identifiers';
import { LiveCategoryEntity } from '../../adapters/repositories/entities/LiveCategoryEntity';
import { AppDependencies } from '../../app/config/AppDependencies';

const categoryNames = [
  'Technology',
  'Business',
  'Health & Wellness',
  'Education',
  'Entertainment',
  'Sports',
  'Food & Cooking',
  'Travel',
  'Fashion',
  'Personal Development'
];

const main = async (container: AppDependencies) => {
  const entityManager = container.get<EntityManager>(Identifiers.entityManager);
  
  // Create 10 live categories
  const categories = categoryNames.map(name => {
    const category = new LiveCategoryEntity();
    category.id = uuidv4();
    category.name = name;
    return category;
  });
  
  // Save all categories to the database
  try {
    await entityManager.save(categories);
    console.log(`Successfully seeded ${categories.length} live categories`);
    return categories;
  } catch (error) {
    console.error('Error seeding live categories:', error.message);
    throw error;
  }
};

export default main;