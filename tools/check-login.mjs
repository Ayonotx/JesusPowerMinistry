/**
 * Checks the admin credentials against the live site (read-only).
 *   node tools/check-login.mjs
 */
import https from "node:https";

const USER = "jpsmrc";
const PASS = process.argv[2] || "JpsmrcTemp!2026";
const HOST = "jesuspowersmrc.org";

function req(path, { method = "GET", body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(body) : null;
    const r = https.request(
      {
        host: HOST,
        port: 443,
        path,
        method,
        headers: {
          "User-Agent": "jpsmrc-check/1.0",
          ...(cookie ? { Cookie: cookie } : {}),
          ...(payload
            ? { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": payload.length }
            : {}),
        },
        timeout: 30000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") }));
      }
    );
    r.on("timeout", () => r.destroy(new Error("timeout")));
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}

const page = await req("/admin/index.php");
const cookies = (page.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const token = (page.body.match(/name="_csrf" value="([a-f0-9]+)"/) || [])[1];
if (!token) {
  console.log("NO CSRF TOKEN — page shape changed");
  process.exit(1);
}

const body = new URLSearchParams({ _csrf: token, username: USER, password: PASS }).toString();
const login = await req("/admin/index.php", { method: "POST", body, cookie: cookies });
const location = login.headers.location || "";
// PHP regenerates the session id on success, so take the new cookie.
const fresh = (login.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const dashboard = await req("/admin/dashboard.php", { cookie: fresh || cookies });

console.log("POST status:", login.status, "→", location || "(no redirect)");
console.log("dashboard status:", dashboard.status);
console.log("signed in:", dashboard.body.includes("Dashboard") && dashboard.body.includes("Signed in as"));
console.log(cookies.match(/jpsmrc_admin=([^;]+)/) ? "session cookie set" : "no session cookie");
