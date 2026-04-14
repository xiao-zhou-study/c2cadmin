# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 admin dashboard for "校园二手交易平台" (Campus Second-hand Trading Platform). It manages users, products, orders, reviews, notifications, and system operations.

## Build Commands

```bash
npm run dev       # Start dev server on port 4000, proxies /api to localhost:10010
npm run build     # Production build (runs vue-tsc then vite build)
npm run preview   # Preview production build locally
npm run type-check # TypeScript check without emitting files
npm run lint      # ESLint with auto-fix
```

## Architecture

### Tech Stack
- Vue 3 + TypeScript + Vite
- Pinia (state management) + Vue Router
- Element Plus (UI) with zhCn locale, all icons registered globally
- Axios for HTTP with JWT token refresh mechanism
- SCSS with auto-injected variables (`@use "@/styles/variables.scss" as *`)

### Directory Structure
- `src/api/` - API modules (auth, user, role, item, category, order, log, etc.) - each exports functions using the request utility
- `src/stores/` - Pinia stores: `app.ts` (sidebar/device state), `user.ts` (auth/token/userInfo with refresh logic)
- `src/views/` - Page components organized by feature: `system/`, `item/`, `order/`, `blog/`, `dashboard/`
- `src/layout/` - Layout wrapper with Sidebar, Navbar, TagsView, AppMain components
- `src/types/` - TypeScript interfaces for User, Item, Order, Category, Notification, etc.
- `src/utils/` - Utilities: `request.ts` (axios wrapper with interceptors), `storage.ts`, `error-handler.ts`
- `src/router/` - Route definitions with auth guard and NProgress

### Key Patterns

**API Layer**: Uses `src/utils/request.ts` axios instance with:
- Request interceptor: attaches `authorization` header and `X-Client-Type: admin`
- Response interceptor: handles Gateway unified response format (code 0/200 = success, returns `data`)
- 401 handling: automatic token refresh via `/as/accounts/refresh` with request queue

**Token Refresh**: Built into `user.ts` store:
- JWT expiration checked via `exp` claim, refreshes 2 minutes before expiry
- Cookie-based refresh token, new JWT returned
- Request queue prevents concurrent refresh attempts

**Development Proxy**: Vite proxies `/api` → `http://127.0.0.1:10010` (Gateway), which routes by path prefix (`/as`, `/us`, `/is`, etc.) to microservices.

**Route Guard**: `router/index.ts` beforeEach checks token validity, attempts refresh if expired, redirects to `/login` on failure.

### Adding New Features
1. Add types in `src/types/index.ts`
2. Create API module in `src/api/`
3. Add route in `src/router/index.ts` under appropriate parent
4. Create view in `src/views/` following existing page patterns (Element Plus table/dialog/form)
5. Update Sidebar if adding new menu section

## TypeScript Configuration

Path alias: `@/*` maps to `src/*`. Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`.