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
  const migrationsDir = path.join(__dirname, 'migrations');
  const entries = fs
    .readdirSync(migrationsDir)
    .filter((name) => name !== 'migration_lock.toml')
    .sort();

  for (const entry of entries) {
    const sqlPath = path.join(migrationsDir, entry, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;

    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.executeMultiple(sql);
    console.log(`已套用 ${entry}`);
  }

  console.log('Turso schema 更新完成');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
