# Debugger Report: ngrok URL Error
**Date:** 2026-03-19
**URL:** https://yuko-unremonstrated-noah.ngrok-free.dev/en

---

## Executive Summary

The ngrok URL is not broken — the **app server is running fine and returning HTTP 200**. The issue is a **port mismatch**: ngrok tunnels port 3001, but the most recent ThinkNote dev server started on port 3003 (via `--port 3003` flag). Port 3001 happens to have an **older or secondary Next.js instance** running, which causes the ngrok browser to show the **ERR_NGROK_6024 interstitial** (free-tier browser warning page).

---

## Findings

### Port Map (Current State)

| Port | PID   | What                        | HTTP Status |
|------|-------|-----------------------------|-------------|
| 3000 | 20832 | Next.js (ThinkNote)         | 200         |
| 3001 | 35924 | Next.js (ThinkNote)         | 200         |
| 3003 | —     | Dev server log target       | 000 (dead)  |
| 4040 | 4968  | ngrok admin API             | —           |

**ngrok tunnel target:** `http://localhost:3001`
**Dev server log shows:** `next dev --port 3003` (but port 3003 is NOT reachable)

### Root Cause

**ERR_NGROK_6024** = ngrok free-tier browser interstitial warning page. This appears in browsers visiting any free ngrok tunnel URL on first visit. It is **not a server error** — the tunnel is working.

However there are **two compounding issues**:

1. **Port confusion:** Three separate Next.js processes are running simultaneously (3000, 3001, 3003 attempted). The dev server log recorded `--port 3003` but that port is dead/not listening. Port 3001 is the actual live server that ngrok reaches.

2. **ERR_NGROK_6024 interstitial:** Free ngrok accounts show a browser warning page on the first visit. The user must click "Visit Site" to proceed. This is a **ngrok free-tier limitation**, not an app error.

3. **Google Fonts dependency:** `globals.css` imports Fira Sans/Code from `fonts.googleapis.com` via `@import url(...)`. If the ngrok client's machine has no internet or Google Fonts is blocked, fonts will fail silently. The `next/font/google` import in `layout.tsx` (Fira_Sans) would also fail in offline/restricted environments. This causes **unstyled text fallback** but not a blank page.

### Server Health

- Port 3001: Returns full ThinkNote HTML (HTTP 200) — app is healthy
- Port 3000: Returns full ThinkNote HTML (HTTP 200) — separate instance
- ngrok URL: Returns HTTP 200 via curl (but browsers get the interstitial on first visit)

---

## What the Visitor Sees

On first visit to the ngrok URL, browsers show:
> "You are about to visit yuko-unremonstrated-noah.ngrok-free.dev... (ERR_NGROK_6024)"

After clicking "Visit Site", the app loads normally from port 3001.

---

## Recommendations

### Immediate Fix (resolve ERR_NGROK_6024 interstitial)

Add `ngrok-skip-browser-warning` header to bypass the interstitial:

```
# Share this URL format instead:
https://yuko-unremonstrated-noah.ngrok-free.dev/en
# With header: ngrok-skip-browser-warning: true
```

Or add it to `next.config.mjs` so all responses include the bypass header:

```js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'ngrok-skip-browser-warning', value: 'true' }],
      },
    ];
  },
};
```

### Clean Up Stale Processes

Kill all Next.js instances and start fresh on a single port:

```bash
# Kill all node processes on these ports, then:
npm run dev  # starts on 3000 by default
# Then re-point ngrok: ngrok http 3000
```

### Fix Google Fonts Double-Import

`globals.css` has `@import url('https://fonts.googleapis.com/...')` AND `layout.tsx` uses `next/font/google` for the same Fira Sans font. This is **redundant** — `next/font/google` is the correct approach (self-hosted, faster). Remove the `@import` from `globals.css`.

File: `src/styles/globals.css` — remove line:
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
```

---

## Summary

| Issue | Severity | Fix |
|-------|----------|-----|
| ERR_NGROK_6024 interstitial | Medium — expected for free tier | Add `ngrok-skip-browser-warning` header in next.config.mjs |
| Multiple stale Next.js instances (3000, 3001) | Low — causes confusion | Kill stale processes, run one instance |
| Google Fonts double import (CSS @import + next/font) | Low — performance | Remove @import from globals.css |

---

## Unresolved Questions

- Which port should be the canonical dev port for this project? (package.json `dev` script uses default 3000, but dev-server.log used 3003)
- Who started the processes on 3000 and 3001 — are these from a previous session?
