# Debugger Report: "missing required error components" on ngrok URL

**Date:** 2026-03-19
**URL:** https://yuko-unremonstrated-noah.ngrok-free.dev/en
**Status:** RESOLVED (self-healed during investigation)

---

## Executive Summary

The "missing required error components, refreshing..." loop was a **transient Next.js dev-mode 404 page** caused by the dev server being mid-startup or mid-rebuild when the ngrok request arrived. The page recovered on its own once the server finished compiling. No code changes needed.

---

## Root Cause

**Next.js was mid-startup when the ngrok request was served.**

- The dev server log shows it started on **port 3003** (ports 3000-3002 were already in use)
- Ngrok is tunneled to **localhost:3001** (confirmed via ngrok API at `localhost:4040/api/tunnels`)
- Port 3001 had a separate, older Next.js server instance running on it
- When Next.js is compiling or reloading, it returns a special 404 holding page with this exact HTML:

```html
<pre>missing required error components, refreshing...</pre>
<script>
  async function check() {
    const res = await fetch(location.href).catch(() => ({}))
    if (res.status === 200) { location.reload() }
    else { setTimeout(check, 1000) }
  }
  check()
</script>
```

This is Next.js's built-in behavior during dev-mode compilation — it serves this page while error overlay components are loading, then auto-refreshes when ready.

---

## Evidence

| Check | Result |
|---|---|
| ngrok HTTP status (initial) | 404 with "missing required error components" |
| ngrok HTTP status (1 min later) | 200 — page fully loaded |
| localhost:3001/en | 200 |
| localhost:3003/en | 200 |
| ngrok tunnel target | `http://localhost:3001` |
| Build timestamps (3001 vs 3003) | 1773891434227 vs 1773891434361 (134ms apart, same restart) |
| Server log | Dev server started on port 3003 (3000-3002 were in use) |

---

## Timeline

1. Dev server restarted → tried ports 3000, 3001, 3002, landed on 3003
2. The server on port 3001 (ngrok's target) was mid-compile during that restart
3. Next.js served the "missing required error components" holding page for ~60s
4. Compilation finished → page auto-recovered to 200

---

## Recommendations

### Immediate (prevent recurrence)

1. **Pin ngrok to a dedicated, consistent port.** Run the dev server explicitly on a fixed port:
   ```bash
   # In package.json or start script:
   next dev -p 3001
   ```
   Or set environment variable: `PORT=3001 next dev`

2. **Kill orphan dev servers before starting a new one:**
   ```bash
   # Find and kill all Next.js dev processes before npm run dev
   npx kill-port 3000 3001 3002 3003
   ```

3. **Update `.claude/dev-server.log` writer** to include the actual port number prominently so port mismatches are caught immediately.

### Long-term

- Consider a `next.config.js` approach that always uses port 3001 for dev, making ngrok config stable across restarts.
- Add a health-check endpoint (e.g., `/api/health`) that ngrok or CI can poll to confirm readiness before routing traffic.

---

## No Code Fix Required

The error is infrastructure/process-level, not a bug in the application code. The page, layout, middleware, and i18n config all function correctly.

---

## Unresolved Questions

- Why are ports 3000-3002 occupied? Other dev server instances from previous sessions may be running and not properly terminated. Consider checking `netstat -ano | findstr :3000` and killing stale Node processes.
