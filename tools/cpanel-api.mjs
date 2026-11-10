/**
 * Minimal cPanel UAPI client for the JPSMRC deploy.
 *
 *   node tools/cpanel-api.mjs list <dir>
 *   node tools/cpanel-api.mjs get <remoteFile>
 *   node tools/cpanel-api.mjs mkdir <parentDir> <name>
 *   node tools/cpanel-api.mjs put <localFile> <remoteFile>
 *   node tools/cpanel-api.mjs del <dir> <file>
 *
 * Credentials live in tools/cpanel.local.json (git-ignored).
 */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
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
                "User-Agent": "jpsmrc-deploy/1.0",
              }
            : { "User-Agent": "jpsmrc-deploy/1.0" }),
        },
        timeout: 90000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") })
        );
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
    return { errors: [body.slice(0, 200)], data: null };
  }
}

const [command, ...args] = process.argv.slice(2);

try {
  if (command === "list") {
    const dir = args[0] || "/public_html";
    const res = await request(
      `/execute/Fileman/list_files?dir=${encodeURIComponent(dir)}&types=${encodeURIComponent("file|dir")}&include_mime=0`
    );
    const json = parse(res.body);
    console.log("HTTP", res.status);
    if (json.errors?.length) console.log("ERRORS:", json.errors.join("; "));
    console.log("ITEMS:", (json.data || []).length, "in", dir);
    for (const item of json.data || []) {
      console.log([item.type === "dir" ? "DIR " : "FILE", String(item.size).padStart(10), item.file].join("  "));
    }
  } else if (command === "get") {
    const remote = args[0];
    const dir = remote.slice(0, remote.lastIndexOf("/")) || "/";
    const json = parse(
      (
        await request(
          `/execute/Fileman/get_file_content?dir=${encodeURIComponent(dir)}&file=${encodeURIComponent(
            basename(remote)
          )}`
        )
      ).body
    );
    if (json.errors?.length) console.error("ERRORS:", json.errors.join("; "));
    process.stdout.write(json.data?.content ?? "");
  } else if (command === "mkdir") {
    const [dir, name] = args;
    const res = await request("/execute/Fileman/mkdir", { dir, name, permissions: "0755" });
    const json = parse(res.body);
    console.log("HTTP", res.status, "mkdir", name, json.errors?.length ? json.errors.join("; ") : "ok");
  } else if (command === "api2") {
    // Generic cPanel API2 call:  api2 <module> <func> key=value ...
    const [module, func, ...pairs] = args;
    const params = {
      cpanel_jsonapi_user: config.user,
      cpanel_jsonapi_apiversion: "2",
      cpanel_jsonapi_module: module,
      cpanel_jsonapi_func: func,
    };
    for (const pair of pairs) {
      const index = pair.indexOf("=");
      if (index > 0) params[pair.slice(0, index)] = pair.slice(index + 1);
    }
    const res = await request(`/json-api/cpanel?${new URLSearchParams(params).toString()}`);
    console.log("HTTP", res.status, res.body.slice(0, 400));
  } else if (command === "mkdir2") {
    // cPanel API2 fallback (some builds do not expose Fileman::mkdir via UAPI).
    const [dir, name] = args;
    const query = new URLSearchParams({
      cpanel_jsonapi_user: config.user,
      cpanel_jsonapi_apiversion: "2",
      cpanel_jsonapi_module: "Fileman",
      cpanel_jsonapi_func: "mkdir",
      dir,
      name,
      permissions: "0755",
    });
    const res = await request(`/json-api/cpanel?${query.toString()}`);
    console.log("HTTP", res.status, res.body.slice(0, 300));
  } else if (command === "save2") {
    // cPanel API2 savefile: creates a file if the directory exists.
    const [localPath, remote] = args;
    const dir = remote.slice(0, remote.lastIndexOf("/")) || "/";
    const file = basename(remote);
    const content = await readFile(localPath, "utf8");
    const query = new URLSearchParams({
      cpanel_jsonapi_user: config.user,
      cpanel_jsonapi_apiversion: "2",
      cpanel_jsonapi_module: "Fileman",
      cpanel_jsonapi_func: "savefile",
      dir,
      filename: file,
      content,
      charset: "UTF-8",
    });
    const res = await request(`/json-api/cpanel?${query.toString()}`);
    console.log("HTTP", res.status, res.body.slice(0, 300));
  } else if (command === "put") {
    const [localPath, remote] = args;
    const dir = remote.slice(0, remote.lastIndexOf("/")) || "/";
    const file = basename(remote);
    const content = await readFile(localPath, "utf8");
    const res = await request("/execute/Fileman/save_file_content", {
      dir,
      file,
      content,
      from_charset: "UTF-8",
      to_charset: "UTF-8",
    });
    const json = parse(res.body);
    const errs = json.errors || [];
    console.log(`HTTP ${res.status}  ${errs.length ? "FAIL " + errs.join("; ") : "ok"}  ${remote}  ${content.length}b`);
    if (errs.length) process.exitCode = 1;
  } else if (command === "del") {
    const [dir, file] = args;
    const res = await request("/execute/Fileman/unlink_files", { dir, files: file });
    const json = parse(res.body);
    console.log("HTTP", res.status, "del", file, json.errors?.length ? json.errors.join("; ") : "ok");
  } else {
    console.log("usage: list <dir> | get <file> | mkdir <dir> <name> | put <local> <remote> | del <dir> <file>");
  }
} catch (error) {
  console.error("FAILED:", error.message);
  process.exit(1);
}
