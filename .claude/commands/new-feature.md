Add a new data feature (model + API + Redux slice + Saga) to this Next.js app.

Arguments: $ARGUMENTS (format: "FeatureName description")

Steps:
1. Add a model to `prisma/schema.prisma` if needed, then run `pnpm db:migrate`
2. Create API routes: `src/app/api/$feature/route.js` (GET, POST) and `src/app/api/$feature/[id]/route.js` (GET, PATCH, DELETE)
3. Add fetch wrappers to `src/redux/api/apiService.jsx`
4. Create a Redux slice at `src/redux/slices/${feature}Slice.js` — actions: FETCH_*, SET_*, CREATE_*, ADD_*, UPDATE_*, PATCH_*, DELETE_*, REMOVE_*, SET_*_ERROR
5. Create a saga at `src/redux/saga/${feature}.jsx` with takeLatest for fetches, takeEvery for mutations
6. Register the saga in `src/redux/saga/index.jsx`
7. Add the slice reducer to `src/redux/store.js`

Rules:
- Never import PrismaClient directly in routes — use `src/lib/prisma.js`
- All API validation at the route level
- Saga only calls apiService, never fetch directly
- Action type naming: UPPER_SNAKE_CASE
