const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('缺少 TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN，請檢查 .env');
  }

  const client = createClient({ url, authToken });

  // Create migration tracking table if it doesn't exist
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_MigrationHistory" (
      "migration_name" TEXT NOT NULL PRIMARY KEY,
      "applied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = new Set(
    (await client.execute('SELECT migration_name FROM "_MigrationHistory"'))
      .rows.map((r) => r.migration_name),
  );

  const migrationsDir = path.join(__dirname, 'migrations');
  const entries = fs
    .readdirSync(migrationsDir)
    .filter((name) => name !== 'migration_lock.toml')
    .sort();

  for (const entry of entries) {
    if (applied.has(entry)) {
      console.log(`跳過（已套用）${entry}`);
      continue;
    }

    const sqlPath = path.join(migrationsDir, entry, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;

    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.executeMultiple(sql);
    await client.execute({
      sql: 'INSERT INTO "_MigrationHistory" (migration_name) VALUES (?)',
      args: [entry],
    });
    console.log(`已套用 ${entry}`);
  }

  console.log('Turso schema 更新完成');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
