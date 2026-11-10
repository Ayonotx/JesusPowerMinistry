import { readFile, writeFile, readdir } from "node:fs/promises";

const VERSION = "20261110h";

const htmlFiles = (await readdir(".")).filter((f) => f.endsWith(".html"));
let changed = 0;

for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  const before = html;

  html = html.replace(/(href="assets\/css\/style\.css)(\?[^"]*)?(")/g, `$1?v=${VERSION}$3`);
  html = html.replace(/(src="assets\/js\/script\.js)(\?[^"]*)?(")/g, `$1?v=${VERSION}$3`);

  if (html !== before) {
    await writeFile(file, html);
    changed++;
    console.log("versioned", file);
  }
}

const adminFiles = ["admin/index.php", "admin/setup.php", "admin/health.php", "admin/inc/layout.php"];
for (const file of adminFiles) {
  let content = await readFile(file, "utf8");
  const before = content;
  content = content.replace(/(href="assets\/admin\.css)(\?[^"]*)?(")/g, `$1?v=${VERSION}$3`);
  content = content.replace(/(src="assets\/admin\.js)(\?[^"]*)?(")/g, `$1?v=${VERSION}$3`);
  if (content !== before) {
    await writeFile(file, content);
    console.log("versioned", file);
  }
}

console.log(`\n${changed} page(s) updated to ?v=${VERSION}`);
