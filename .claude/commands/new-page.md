Create a new page in this Next.js app following the project's three-file contract.

Arguments: $ARGUMENTS (format: "page-name description")

Steps:
1. Create `src/app/$PAGE_NAME/page.jsx` — route entry with metadata only, no 'use client'
2. Create `src/app/$PAGE_NAME/content.jsx` — mark 'use client', handle hooks/dispatch/UI
3. Create `src/app/$PAGE_NAME/page.module.scss` — import variables: `@use '@styles/variables.module' as v;`
4. Add a nav link in `src/components/NavBar/NavBar.jsx` if it's a top-level route

Rules to follow:
- page.jsx only imports content.jsx and exports metadata
- content.jsx dispatches Redux actions, never calls fetch directly
- SCSS must use variables from variables.module.scss, no raw px values
- UI text must be in English
- No extra files, no TypeScript, stay in JSX
