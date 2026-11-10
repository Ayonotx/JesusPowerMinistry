/**
 * Deploy the JPSMRC update to the cPanel host.
 *   node tools/deploy.mjs
 */
import { readFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import https from "node:https";

const config = JSON.parse(await readFile(new URL("./cpanel.local.json", import.meta.url), "utf8"));
const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

function request(path, form) {
  return new Promise((resolve, reject) => {
    const payload = form ? Buffer.from(new URLSearchParams(form).toString()) : null;
    const req = https.request(
      {
        host: config.host,
        port: config.port,
        path,
        method: payload ? "POST" : "GET",
        agent,
        headers: {
          Authorization: `cpanel ${config.user}:${config.token}`,
          ...(payload
            ? {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": payload.length,
              }
            : {}),
          "User-Agent": "jpsmrc-deploy/1.0",
        },
        timeout: 90000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function parse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return { errors: [body.slice(0, 160)], data: null };
  }
}

const DIRS = [
  "/public_html/admin",
  "/public_html/admin/inc",
  "/public_html/admin/assets",
  "/public_html/data",
  "/public_html/data/private",
  "/public_html/assets/img/uploads",
];

// local path (relative to repo root) -> remote path
const FILES = [
  ["index.html", "/public_html/index.html"],
  ["about.html", "/public_html/about.html"],
  ["ministry.html", "/public_html/ministry.html"],
  ["retreat.html", "/public_html/retreat.html"],
  ["admissions.html", "/public_html/admissions.html"],
  ["events.html", "/public_html/events.html"],
  ["gallery.html", "/public_html/gallery.html"],
  ["videos.html", "/public_html/videos.html"],
  ["contact.html", "/public_html/contact.html"],
  ["404.html", "/public_html/404.html"],

  ["assets/css/style.css", "/public_html/assets/css/style.css"],
  ["assets/js/script.js", "/public_html/assets/js/script.js"],

  ["sitemap.xml", "/public_html/sitemap.xml"],

  ["data/.htaccess", "/public_html/data/.htaccess"],
  ["data/private/.htaccess", "/public_html/data/private/.htaccess"],

  // NOTE: data/events.json, data/gallery.json and data/announcements.json are
  // owned by the admin panel at runtime. Never deploy them over live content —
  // that would wipe anything the ministry office has added.

  ["admin/index.php", "/public_html/admin/index.php"],
  ["admin/setup.php", "/public_html/admin/setup.php"],
  ["admin/logout.php", "/public_html/admin/logout.php"],
  ["admin/dashboard.php", "/public_html/admin/dashboard.php"],
  ["admin/events.php", "/public_html/admin/events.php"],
  ["admin/media.php", "/public_html/admin/media.php"],
  ["admin/announcements.php", "/public_html/admin/announcements.php"],
  ["admin/account.php", "/public_html/admin/account.php"],
  ["admin/health.php", "/public_html/admin/health.php"],
  ["admin/inc/bootstrap.php", "/public_html/admin/inc/bootstrap.php"],
  ["admin/inc/auth.php", "/public_html/admin/inc/auth.php"],
  ["admin/inc/layout.php", "/public_html/admin/inc/layout.php"],
  ["admin/inc/uploads.php", "/public_html/admin/inc/uploads.php"],
  ["admin/assets/admin.css", "/public_html/admin/assets/admin.css"],
  ["admin/assets/admin.js", "/public_html/admin/assets/admin.js"],
  ["admin/.htaccess", "/public_html/admin/.htaccess"],
  ["assets/img/uploads/.htaccess", "/public_html/assets/img/uploads/.htaccess"],
];

let ok = 0;
const failures = [];

for (const dir of DIRS) {
  const parent = dirname(dir);
  const name = basename(dir);
  const params = {
    cpanel_jsonapi_user: config.user,
    cpanel_jsonapi_apiversion: "2",
    cpanel_jsonapi_module: "Fileman",
    cpanel_jsonapi_func: "mkdir",
    path: parent,
    name,
    permissions: "0755",
  };
  const res = await request(`/json-api/cpanel?${new URLSearchParams(params).toString()}`);
  let parsed;
  try {
    parsed = JSON.parse(res.body).cpanelresult;
  } catch {
    parsed = {};
  }
  const created = parsed?.event?.result === 1;
  console.log(`mkdir ${dir} ${created ? "ok" : "exists/handled"}`);
}

for (const [local, remote] of FILES) {
  const dir = remote.slice(0, remote.lastIndexOf("/"));
  const file = basename(remote);
  let content;
  try {
    content = await readFile(local, "utf8");
  } catch {
    failures.push(`${local} (missing locally)`);
    console.log(`SKIP ${local} — not found locally`);
    continue;
  }

  const res = await request("/execute/Fileman/save_file_content", {
    dir,
    file,
    content,
    from_charset: "UTF-8",
    to_charset: "UTF-8",
  });
  const errors = parse(res.body).errors || [];
  if (res.status === 200 && !errors.length) {
    ok++;
    console.log(`ok   ${remote}  ${content.length}b`);
  } else {
    failures.push(`${remote}: ${errors.join("; ") || res.status}`);
    console.log(`FAIL ${remote}  ${errors.join("; ") || res.status}`);
  }
}

console.log(`\n${ok}/${FILES.length} uploaded`);
if (failures.length) {
  console.log("Failures:\n" + failures.join("\n"));
  process.exitCode = 1;
}
