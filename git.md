# SALA — Git Changelog

**Repository:** `wolf1276/stellar_lv5`  
**Branch:** `main`  
**Session Date:** 2026-04-26  

---

## Commits

---

### 1. `fix: replace native alert() with sonner toast on wallet-gated actions`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | Blocking browser `alert()` popups were freezing the UI on every transaction event, making the app feel unpolished and breaking mobile UX. |
| **Changes Made** | Installed `sonner` library. Added `<Toaster richColors position="top-right" />` to `app/layout.tsx`. Replaced all `alert()` calls in `app/page.tsx` and `app/arbitrage/page.tsx` with `toast.success()`, `toast.error()`, and `toast.warning()`. The arbitrage success toast includes a clickable "View Explorer" action button. |
| **Files Modified** | `app/layout.tsx`, `app/page.tsx`, `app/arbitrage/page.tsx` |

---

### 2. `feat: persist wallet address in localStorage across page refreshes`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | Every page refresh disconnected the wallet, forcing users to reconnect manually on every visit — a critical friction point for a trading dApp. |
| **Changes Made** | Refactored `StellarContext.tsx` to wrap the address setter with a `useCallback` that writes the public key to `localStorage` on connect and removes it on disconnect. Added a mount `useEffect` that rehydrates the address from `localStorage`. Only the public key is stored — no signing credentials. |
| **Files Modified** | `context/StellarContext.tsx` |

---

### 3. `fix: prevent logo/connect-button overlap on small viewports`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | On iPhone-sized screens (≤375px), the SALA logo and the Connect Wallet button were overlapping and squishing each other, making the top nav unusable on mobile. |
| **Changes Made** | Added `gap-2` to the nav header, `min-w-0 flex-shrink` to the logo container, `flex-shrink-0` to the actions container, `max-w-[160px]` and `truncate` to the app title span, and `flex-shrink-0` to the logo `<Image>` element. |
| **Files Modified** | `components/TopNavBar.tsx` |

---

### 4. `improve: replace static greyed-out cards with animated skeleton loaders`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | The two placeholder cards (Cross-DEX and Liquidation) looked broken — they were greyed-out with static "---" text, making users think the app had an error. |
| **Changes Made** | Replaced both static cards in `app/page.tsx` with `animate-pulse` skeleton versions. Each skeleton shows a pinging `●` dot indicator in the header, three shimmering content bars at varying widths, a scanning status caption, and a skeleton button bar. |
| **Files Modified** | `app/page.tsx` |

---

### 5. `feat: implement client-side fuzzy search over pages and asset routes`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | The search bar in the TopNav was a non-functional placeholder — typing in it did nothing, which confused users who expected to search assets or navigate quickly. |
| **Changes Made** | Created `lib/search-index.ts` with 31 searchable entries across three categories (pages, routes, assets). Rewrote `components/TopNavBar.tsx` to filter the index on every keystroke, show a dropdown panel with results (label, type badge, description), navigate on click via `router.push()`, and dismiss on outside click. Added a "No results" empty state and a clear (×) button. |
| **Files Modified** | `lib/search-index.ts` (new), `components/TopNavBar.tsx` |

---

### 6. `fix: sync sidebar active highlight on router.push() navigation`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | The "View History" button on the dashboard was a dead `<button>` with no navigation wired up. Clicking it did nothing, and even if it had been wired via `router.push()`, the sidebar active state would not update. |
| **Changes Made** | Added `import Link from 'next/link'` to `app/page.tsx`. Converted the "View History" `<button>` to `<Link href="/history">` so navigation updates the URL, which triggers `usePathname()` in the sidebar to correctly highlight the active route. |
| **Files Modified** | `app/page.tsx` |

---

### 7. `feat: add in-app alert badge to notification bell for arb signals`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | The notification bell icon was purely decorative — it had no state, no badge, and clicking it did nothing. There was no way to surface arbitrage signals or system alerts to the user within the app. |
| **Changes Made** | Added `AppAlert` interface (exported), `notifications` state, `addAlert()` and `clearAlerts()` callbacks to `StellarContext.tsx`. Updated `TopNavBar.tsx` to show a yellow badge with unread count on the bell, and a dropdown panel with a scrollable alert list (type-colored icons: bolt / check_circle / warning), a "Clear all" button, and an empty state. Dropdown dismisses on outside click. |
| **Files Modified** | `context/StellarContext.tsx`, `components/TopNavBar.tsx` |

---

### 8. `feat: add interactive slippage tolerance selector on arbitrage page`

| Field | Detail |
|---|---|
| **Username** | wolf1276 |
| **Problem Addressed** | Slippage tolerance was hardcoded as a static "0.10%" label with no way for users to adjust it — a major missing feature for any serious arbitrage trading interface. |
| **Changes Made** | Added `slippage` and `customSlippage` state to `app/arbitrage/page.tsx`. Replaced the static slippage row in the Execution Summary sidebar with three pill buttons (0.1%, 0.5%, 1.0%) highlighted in yellow when selected, plus a "Custom" pill that reveals a number input (0–50%, step 0.1) when active. |
| **Files Modified** | `app/arbitrage/page.tsx` |

---

## Push Summary

```
To https://github.com/wolf1276/stellar_lv5
   0a12cc1..d7d585f  main -> main
```

**Total:** 8 commits · 9 files modified · 1 new file created
