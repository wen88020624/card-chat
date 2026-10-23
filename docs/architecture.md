# Card Chat 系統架構

給人和 AI 快速定位用的架構地圖。程式碼慣例（命名、樣式、三檔頁面）寫在根目錄 `CLAUDE.md`；產品需求寫在 `docs/wishlist.md`。這份只描述「系統怎麼組起來」。改了架構就改這份。

## 一句話

Next.js 16 App Router 的對話卡抽牌 app：使用者登入後，管理自己的分類與卡片（`/manage`），再以扇形牌堆抽卡（`/draw`）。前端 Redux + Saga，後端是 Route Handlers + Prisma，資料庫是 Turso（libSQL），部署在 Vercel。

## 系統圖

```
Browser
  │  page (/draw, /manage, /login, /register)
  │
  ├─ src/proxy.js ─────────── 每個受保護請求先過這裡（NextAuth session 檢查）
  │
  ├─ Client Components (content.jsx)
  │     dispatch(ACTION) → Saga → apiService.fetchApi → /api/*
  │
  └─ /api/* Route Handlers
        auth() 取 session.user.id → Prisma (src/lib/prisma.jsx)
                                        │ @prisma/adapter-libsql
                                        ▼
                                     Turso (libSQL)
```

## 目錄地圖

| 路徑 | 職責 |
|---|---|
| `src/auth.js` | NextAuth v5 設定：Credentials provider、JWT session、`normalizeEmail()` |
| `src/proxy.js` | Next 16 的 Proxy（原 middleware）：未登入導向 `/login`；已登入不准看 `/login`、`/register` |
| `src/app/api/auth/[...nextauth]/route.js` | NextAuth 的 GET/POST handler |
| `src/app/api/auth/register/route.js` | 註冊：驗證 → bcrypt hash → 建 `User` |
| `src/app/api/categories/**`, `src/app/api/cards/**` | CRUD，**每個 handler 都以 session 的 userId 篩資料** |
| `src/app/{draw,manage,login,register}/` | 頁面（`page.jsx` + `content.jsx` + `page.module.scss`） |
| `src/app/layout.jsx` | `SessionProvider` → Redux `Provider` → Joy `CssVarsProvider` → `NavBar` |
| `src/components/DrawDeck/` | 抽牌動畫（扇形、拖曳、飛出翻面），見下方「抽牌」 |
| `src/components/NavBar/` | 導覽列、使用者 email、登出 |
| `src/redux/slices/` | `cardsSlice`、`categoriesSlice`、`drawSlice` |
| `src/redux/saga/` | 監聽 action 呼叫 API，`put(SET_*)` 回 store |
| `src/redux/api/apiService.jsx` | 唯一呼叫 `fetch` 的地方：`categoriesApi`、`cardsApi`、`authApi` |
| `src/lib/prisma.jsx` | PrismaClient 單例，**固定連 Turso** |
| `prisma/schema.prisma` | 資料模型 |
| `prisma/migrations/` | 由本機 SQLite `prisma migrate dev` 產生 |
| `prisma/push-turso.js` | 把尚未套用的 migration SQL 推到 Turso（記錄在 `_MigrationHistory`） |
| `prisma/seed.js` | 清空並建立 seed 使用者 `seed@example.com` / `password123` 與範例卡 |

## 資料模型

```
User 1 ── * Category 1 ── * Card
```

- `User`: `email`（unique，一律小寫、去空白後存）、`passwordHash`（bcrypt, cost 12）
- `Category`: `name` + `userId`，`@@unique([name, userId])`：同一使用者分類名不可重複，不同使用者可以
- `Card`: `content`、`stars`（1–4）、`categoryId`；**卡片沒有 userId，擁有者透過 `category.userId` 判斷**
- 刪 User → cascade 刪 Category → cascade 刪 Card

## 認證

**機制**：NextAuth v5（`next-auth@5.0.0-beta`）Credentials provider + JWT session（無 session 資料表）。

```
註冊  /register → authApi.register → POST /api/auth/register → 建 User
      → signIn('credentials')（自動登入）→ /draw

登入  /login → signIn('credentials', { redirect: false })
      → auth.js authorize(): normalizeEmail → findUnique → bcrypt.compare
      → jwt callback 存 token.userId → session callback 放到 session.user.id
      → router.push(callbackUrl)

保護  proxy.js matcher: /draw, /manage, /login, /register
      API 不在 matcher 內，每個 route handler 自己 `await auth()`，沒 session 回 401

登出  NavBar → signOut({ redirect: false }) → window.location.assign('/login')
      用整頁重載清掉 Redux store，避免同分頁換帳號時看到上個人的牌
```

**資料隔離規則**（新增 API 時必須遵守）：

1. 開頭 `const session = await auth()`，沒有就回 401。
2. `userId = Number(session.user.id)`。
3. 讀寫 Category 時 `where` 帶 `userId`；讀寫 Card 時檢查 `card.category.userId === userId`。
4. 任何會「指向別的資源」的欄位（如 Card 的 `categoryId`）也要驗證該資源屬於同一使用者。
5. 找不到或不屬於自己一律回 404（不透露資源存在）。

**`callbackUrl`**：登入頁只接受 `/` 開頭且非 `//` 的路徑，避免 open redirect。

## 抽牌（`/draw`）

狀態全在 `drawSlice`，抽牌不打 API：

| 欄位 | 意義 |
|---|---|
| `pool` | 依篩選條件從 `/api/cards` 取回的卡 |
| `dealOrder` | 載入或 Reset 時 Fisher–Yates 洗牌後的 id 順序，**整輪固定** |
| `drawnIds` | 本輪已抽出的 id |
| `current` | 目前翻開的卡（`CLOSE_CARD` 只清這個，不放回牌堆） |
| `exhausted` | 牌抽完後又嘗試抽 |

**篩選**：左欄點 chip 立即套用（`filters` 一變就 `FETCH_DRAW_POOL`，沒有「載入」按鈕），換條件會開新一輪。從別頁回到 `/draw` 時若已有 `pool` 就沿用，不重洗。桌面版左欄可收合成 56px 的窄欄（狀態存 `localStorage` 的 `draw.sidebarCollapsed`）；手機版是抽屜，由左上角篩選按鈕開啟。

**選哪張就是哪張**：扇形第 `i` 張（由左到右）＝ `dealOrder` 去掉 `drawnIds` 後的第 `i` 張。`DrawDeck` 回傳 `onDraw(fanIndex)`，`draw/content.jsx` 換成 card id 後 `dispatch(DRAW_CARD(id))`。

**動畫元件** `src/components/DrawDeck/`（使用 `motion` 套件，`import from 'motion/react'`）：

- `DrawDeck.jsx`：版面（上方 stage、下方 fan）、扇形幾何計算、最多顯示 12 張、追蹤滑鼠 `pointerX`
- `FanCard.jsx`：單張牌背。依與游標距離（高斯曲線）浮起；自寫 pointer 手勢：移動 < 6px 視為點擊，向上拖 > 90px 或上甩速度 > 0.6px/ms 視為抽牌；鍵盤 Enter/Space 也可抽
- `RevealedCard.jsx`：從被抽那張的螢幕位置飛到中央（`animate()` 關鍵影格）→ 3D 翻面 → 滑鼠 3D 傾斜；左上 ✕ 關閉；`AnimatePresence` 的 `custom` 決定離場方式（換牌往左上飛出 / 關閉縮小淡出）。點擊相關：離場中的卡加 `.leaving`（`pointer-events: none`）、背面 `pointer-events: none` 且正面 `translateZ(1px)` 讓 3D hit-test 穩定選到正面、游標在 ✕ 上時凍結傾斜
- `draw/content.jsx` 外層包 `<MotionConfig reducedMotion="user">`；元件另用 `useReducedMotion()` 關掉浮起與飛行

## 環境變數

| 變數 | 用途 | 本機 `.env` | Vercel |
|---|---|---|---|
| `DATABASE_URL` | 只給 Prisma CLI（migrate / generate）用的本機 SQLite | 需要 | 不需要 |
| `TURSO_DATABASE_URL` | 執行時資料庫 | 需要 | Production + Preview |
| `TURSO_AUTH_TOKEN` | 同上 | 需要 | Production + Preview |
| `AUTH_SECRET` | NextAuth 簽 JWT，**沒有就整個登入壞掉** | 需要 | **必填**，每個環境各自產生（`npx auth secret` 或 `openssl rand -base64 32`） |
| `AUTH_URL` | NextAuth 對外網址 | `http://localhost:3000` | 不要設（Vercel 會自動偵測；設成 localhost 會讓轉址跑去 localhost） |

> ⚠️ `src/lib/prisma.jsx` 不分環境一律連 Turso，所以**本機 `pnpm dev` 讀寫的是正式資料庫**。測試註冊、刪除等操作前先確認，或另開一個 dev 用 Turso DB 放在 `.env`。

## 資料庫變更流程

```bash
# 1. 改 prisma/schema.prisma
pnpm db:migrate --name <name>   # 在本機 SQLite 產生 migration
# 2. 檢查 migration.sql：加 NOT NULL 欄位到有資料的表時要自己補資料搬移
pnpm db:push:turso              # 把新的 migration 套到 Turso
pnpm db:generate                # 更新 Prisma Client
```

`push-turso.js` 用 `executeMultiple` 跑整份 SQL，**不是 transaction**；中途失敗會留下半套 schema，要手動修。

## 部署

- Vercel 專案 `cart-chat`（`.vercel/project.json`），連 GitHub `wen88020624/card-chat`，push `main` 會觸發 production 部署。
- Build 指令：`prisma generate && next build`。
- Runtime：Node.js（Fluid Compute）；`proxy.js` 也跑在 Node，所以可以直接用 Prisma。
- Schema 變更要**先** `pnpm db:push:turso` 再部署程式碼。

## 已知缺口

- 登入、註冊沒有 rate limit，可被暴力嘗試密碼。
- 沒有忘記密碼、email 驗證。
- 本機開發直連正式資料庫（見上方警告）。
- `email` 正規化（小寫）是後加的；若正式庫已有含大寫的 email，該帳號需手動改成小寫才能登入。
- `draw/content.jsx` 有既存的 Biome a11y 錯誤（mobile backdrop 的 onClick、FAB 缺 `type`）。
