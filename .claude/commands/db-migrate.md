Run a Prisma migration for this project.

Arguments: $ARGUMENTS (migration name, e.g. "add-tags-to-cards")

Steps:
1. Review changes in `prisma/schema.prisma`
2. Run: `pnpm db:migrate -- --name $ARGUMENTS`
3. Run: `pnpm db:generate`
4. Confirm migration was created in `prisma/migrations/`

Notes:
- DATABASE_URL is set to `file:./prisma/dev.db` via `.env`
- Always use cascade deletes on relations that depend on parent models
- Never edit migration SQL files manually
