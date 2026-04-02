import { DatabaseService } from '../apps/api-gateway/src/modules/database/database.service.js';

async function main() {
  const databaseService = new DatabaseService();

  try {
    await databaseService.seedDefaultUsers();
    console.log('Default users seeded successfully.');
  } finally {
    await databaseService.onModuleDestroy();
  }
}

main().catch((error: unknown) => {
  console.error(
    `Failed to seed default users: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
