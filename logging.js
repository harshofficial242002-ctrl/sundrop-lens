// ============================================================================
// Sundrop Lens — logging.js
// Sends access events to a Power Automate flow, which appends a row to an
// Excel table in SharePoint/OneDrive. See README.md "Setting up logging"
// for how to build the flow — takes about 10 minutes, no admin rights needed
// beyond normal Power Automate + SharePoint access most M365 plans include.
//
// Design choices:
// - Fire-and-forget: logging failures never block or slow down the user.
// - No PII beyond what's already in config.js (name, email, function, role) —
//   nothing about report content, just who opened what, when.
// - This raw event stream IS the "daily log." The "monthly summary log" is
//   deliberately NOT built here — point a Power BI report at the same
//   Excel table and build a matrix (employee/function x month), reusing the
//   DAX skills already on the team rather than duplicating a reporting
//   layer in JavaScript.
// ============================================================================

function logEvent(eventType, detail) {
  if (!LOGGING_ENDPOINT) return; // logging disabled — no-op, never throws

  var session = getSession();
  var payload = {
    timestamp: new Date().toISOString(),
    eventType: eventType,              // "login_success" | "login_failed" | "report_view" | "logout"
    email: (session && session.email) || (detail && detail.attemptedEmail) || "",
    name: (session && session.name) || "",
    function: (session && session.function) || "",
    role: (session && session.role) || "",
    reportId: (detail && detail.reportId) || "",
    reportName: (detail && detail.reportName) || ""
  };

  fetch(LOGGING_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(function () {
    // Swallow errors intentionally — a flaky log call should never block
    // someone from seeing their dashboard.
    console.warn("Sundrop Lens: logging call failed (non-blocking).");
  });
}
