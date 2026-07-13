// ============================================================================
// Sundrop Lens — auth.js
// Shared by index.html and dashboard.html. Depends on config.js being
// loaded first (USERS, ROLES, SESSION_MS, LOCK_* constants).
//
// HONEST LIMIT (same as before, still true): this is client-side auth on
// static hosting. USERS (including password hashes) and REPORTS (including
// Power BI URLs) are downloadable by anyone who requests config.js directly,
// regardless of login state. This build makes the experience and audit
// trail much better — real per-person accountability, role-based filtering,
// a proper session timeout — but it does not make the report URLs secret
// from a determined technical user. Closing that gap for real means moving
// the checks server-side; see README.md "Upgrade path" for how the Power
// Automate logging flow already set up here can be extended to do exactly
// that later, without a rebuild.
// ============================================================================

var SESSION_KEY = 'sl_session';

async function sha256Hex(text) {
  var enc = new TextEncoder().encode(text);
  var buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(function (b) { return b.toString(16).padStart(2, '0'); })
    .join('');
}

function findUser(email) {
  var norm = email.trim().toLowerCase();
  return USERS.find(function (u) { return u.email.toLowerCase() === norm; }) || null;
}

async function verifyCredentials(email, password) {
  var user = findUser(email);
  if (!user) return null;
  var hash = await sha256Hex(password);
  return hash === user.passwordHash ? user : null;
}

function setSession(user) {
  var payload = {
    email: user.email,
    name: user.name,
    function: user.function,
    role: user.role,
    exp: Date.now() + SESSION_MS
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

function getSession() {
  try {
    var raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    var payload = JSON.parse(raw);
    if (payload.exp <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

function hasValidSession() {
  return getSession() !== null;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// Guard for dashboard.html — bounce to login if there's no valid session.
// Also polls every 60s so a session that expires mid-use kicks the user
// back to login automatically, rather than silently failing on next click.
function requireSession() {
  var session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  setInterval(function () {
    if (!hasValidSession()) {
      window.location.href = 'index.html?expired=1';
    }
  }, 60000);
  return session;
}

// Reports visible to a given session's role.
function reportsForSession(session) {
  return REPORTS.filter(function (r) {
    return r.allowedRoles.indexOf(session.role) !== -1;
  });
}
