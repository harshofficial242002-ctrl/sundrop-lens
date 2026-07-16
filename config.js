// ============================================================================
// Sundrop Lens — config.js
// Single file to edit when: adding/removing a person, changing someone's
// role, or adding a new report. Nothing else in the codebase should need
// touching for routine access changes.
// ============================================================================

// ---- Session / security constants -----------------------------------------
var SESSION_MS = 4 * 60 * 60 * 1000;   // 4-hour auto-logout, as requested
var LOCK_AFTER_ATTEMPTS = 5;
var LOCK_MS = 30000;

// ---- Logging endpoint -------------------------------------------------------
// Power Automate "When an HTTP request is received" flow URL.
// See README.md "Setting up logging" for how to build this flow.
// Leave blank ('') to disable logging without breaking the app.
var LOGGING_ENDPOINT = "";

// ---- Roles ------------------------------------------------------------------
// Use these as the canonical role strings across USERS and REPORTS.
// Add new roles here first, then reference them below.
var ROLES = {
  LEADERSHIP: "Leadership",       // MD, CEO, Functional Heads
  SALES: "Sales Leadership",      // NSM, RSM
  MARKETING: "Marketing",         // Brand marketeers, Brand Managers
  ANALYTICS: "Analytics Team"     // your own team — sees everything
};

// ---- Users --------------------------------------------------------------
// One entry per person. passwordHash: generate with sha256Hex("their-password")
// in the browser console — see README.md. NEVER put a plaintext password here.
var USERS = [
  {
    email: "harsh.singh@sundropbrands.com",
    name: "Harsh Singh",
    function: "E-Commerce",
    role: ROLES.ANALYTICS,
    passwordHash: "7885587032686ed9e20b8f2c9895a7370944b16cf3f55d6777fe2d622a96b324"
  },
  {
    email: "example.md@sundropbrands.com",
    name: "Example MD",
    function: "Leadership",
    role: ROLES.LEADERSHIP,
    passwordHash: "REPLACE_WITH_HASH"
  },
  {
    email: "example.nsm@sundropbrands.com",
    name: "Example NSM",
    function: "Sales",
    role: ROLES.SALES,
    passwordHash: "REPLACE_WITH_HASH"
  },
  {
    email: "example.brand@sundropbrands.com",
    name: "Example Brand Manager",
    function: "Marketing",
    role: ROLES.MARKETING,
    passwordHash: "REPLACE_WITH_HASH"
  }
  // Add one object per person. Copy-paste the block above and edit.
];

// ---- Reports ------------------------------------------------------------
// allowedRoles controls who sees the tile on the landing page.
// Use ROLES.* constants; a report can list multiple roles.
var REPORTS = [
  {
    id: "sales-cockpit",
    name: "Sales Cockpit",
    description: "Primary, Secondary & POB — overview and billing patterns",
    url: "https://app.powerbi.com/view?r=eyJrIjoiNzgxMGZhZDItNWY0MS00YzFiLWJlMzgtNWZjNjNiZWM3OGFiIiwidCI6IjdiMWRlYzJlLTNiNWMtNDA3OC05MjQ0LTc2NDlkZjZiMjFlYiJ9",
    allowedRoles: [ROLES.LEADERSHIP, ROLES.SALES, ROLES.ANALYTICS]
  },
  {
    id: "distribution-tracker",
    name: "Distribution Tracker",
    description: "Distribution tracking",
    url: "https://app.powerbi.com/view?r=eyJrIjoiMGIwYjkwYmMtOWI0Yy00MzZjLThkODAtYmFjNjQ5Y2FiYjNkIiwidCI6IjdiMWRlYzJlLTNiNWMtNDA3OC05MjQ0LTc2NDlkZjZiMjFlYiJ9",
    allowedRoles: [ROLES.LEADERSHIP, ROLES.SALES, ROLES.MARKETING, ROLES.ANALYTICS]
  }
  // Example of a marketing-only report once it exists:
  // {
  //   id: "brand-eco-tracker",
  //   name: "Brand ECO Tracker",
  //   description: "Distribution width by SKU group and region",
  //   url: "https://app.powerbi.com/view?r=...",
  //   allowedRoles: [ROLES.MARKETING, ROLES.LEADERSHIP, ROLES.ANALYTICS]
  // }
];
