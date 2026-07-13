# Sundrop Lens — access portal (v2)

Two-step flow, per-person login, role-based report access, audit logging.

## What changed from v1

| Area | v1 | v2 |
|---|---|---|
| Login | Shared team password | Individual company email + password |
| Report access | Everyone sees everything | Filtered by role (`config.js`) |
| Session | 8h, no auto-check | 4h, checked every 60s |
| Logging | None | Every login/view sent to Power Automate → Excel |
| Branding | Generic purple | Sundrop palette + placeholder mark |
| Accountability | None (shared password) | Every event attributed to a named person |

---

## Setup — do these in order

### 1. Add your people
Edit `config.js` → `USERS`. One entry per person: email, name, function, role
(pick from `ROLES`), and a password hash.

**To generate a hash:** open `index.html` in a browser, open the console (F12), run:
```js
await sha256Hex("their-chosen-password")
```
Paste the resulting hex string into `passwordHash`. Never write a plaintext
password into any file, commit, or chat message.

### 2. Add your reports
Edit `config.js` → `REPORTS`. Each report needs an `allowedRoles` array —
copy the pattern from the existing entry. Adding a report never requires
touching `index.html` or `dashboard.html`.

### 3. Set up logging (Power Automate → Excel)
This gives you both logs you asked for, using tools already in your M365 plan.

1. In Power Automate, create a flow: **Instant → "When an HTTP request is received."**
2. Set the request body JSON schema to match `logging.js`'s payload:
   ```json
   {
     "type": "object",
     "properties": {
       "timestamp": { "type": "string" },
       "eventType": { "type": "string" },
       "email": { "type": "string" },
       "name": { "type": "string" },
       "function": { "type": "string" },
       "role": { "type": "string" },
       "reportId": { "type": "string" },
       "reportName": { "type": "string" }
     }
   }
   ```
3. Add action **Excel Online (Business) → "Add a row into a table."** Point it
   at an Excel file in SharePoint/OneDrive with a table whose columns match
   the fields above. This file *is* your **daily/raw log** — every login,
   failed login, report view, and logout lands here in real time, one row
   per event, attributed to a real person.
4. Save the flow, copy its HTTP POST URL, paste it into `config.js` →
   `LOGGING_ENDPOINT`.
5. **Monthly summary log:** don't build this in JavaScript — point a small
   Power BI report at the same Excel table (you already have the DAX skills
   for this). A matrix of `function` / `role` / `name` by month, counting
   `report_view` events, is the whole thing — this also means it refreshes
   itself on your existing Power BI cadence, no extra maintenance.
6. **Restrict who can see the raw log file.** It contains an access trail
   for every employee — treat it like the HR-adjacent artifact it is; don't
   leave the SharePoint file open to the whole org.

### 4. Swap in the real Sundrop logo
`index.html` and `dashboard.html` currently use a **placeholder inline SVG**
sun-drop mark, not the real Sundrop logo — I don't have the actual asset
file. Replace the `<svg>...</svg>` blocks with an `<img>` tag pointing at
the official logo (ask your marketing team for the PNG/SVG, or pull it from
the site source), and update the CSS custom properties in both files'
`:root` block with the exact brand hex values once you've sampled them from
a real asset — the values shipped here are close approximations, not
verified brand colors.

### 5. Deploy
Push all files to the GitHub Pages repo as before (Settings → Pages →
deploy from branch/folder). No new hosting needed for this version.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Step 1 — email + password login |
| `dashboard.html` | Step 2 — role-filtered report tiles + embedded viewer |
| `config.js` | **Edit this for routine changes** — users, roles, reports |
| `auth.js` | Hashing, session, role-filtering logic |
| `logging.js` | Sends events to Power Automate |

---

## Security brief — what's fixed, what isn't

**Fixed in this version:**
- Passwords are hashed, not plaintext (repeat: never commit a plaintext password).
- Per-person accountability — no more shared passwords, every action is attributed.
- Role-based access — Marketing no longer sees Sales-only reports, etc.
- Session auto-expires after 4 hours and is actively checked, not just set-and-forget.
- Brute-force attempts are throttled (5 tries, 30s lockout).
- Full audit trail via the Excel log — you can now answer "who looked at what, when."

**Still not fixed (same root cause as v1, documented so nobody assumes otherwise):**
GitHub Pages serves every file — including `config.js`, with its password
hashes and Power BI URLs — to anyone who requests it directly, regardless of
whether they've logged in. Hashing protects the *passwords* (hashes aren't
reversible), but it does not hide the *report URLs*, which remain visible to
anyone who views the raw file. This build is a large trust and usability
upgrade, not a claim that the report links are cryptographically secret.

## Upgrade path (when you're ready, still no new cost)

The Power Automate flow you just built for logging can be extended to also
**gate** access, closing the remaining hole:
1. Change the login flow to POST email+password to that same Power Automate
   flow instead of checking `config.js` in the browser.
2. The flow checks credentials against a SharePoint list (not exposed to the
   browser) and returns the allowed report list + URLs **only on success**.
3. `config.js` no longer needs to contain password hashes or report URLs at
   all — an unauthenticated request never receives them.

This is additive to what's built here, not a rebuild — the front-end stays
almost identical. It also happens to be most of the groundwork for a later
move to real Entra ID SSO, if/when Azure admin access becomes available.

## GitHub best practices (unchanged from prior brief, still apply)

- Move the repo to a Sundrop-owned GitHub org account, not a personal one.
- Rotate any password that was ever committed in plaintext, even in old commits.
- Enable 2FA on all accounts with push access.
- Turn on secret-scanning alerts (private repos support this).
- Use branch protection on `main` — require a PR even for a 2-person team.
- Restrict collaborators to who actually needs access; review periodically.
