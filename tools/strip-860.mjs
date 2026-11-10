import { readFile, writeFile } from "node:fs/promises";

const file = "assets/css/style.css";
let css = await readFile(file, "utf8");
const header = "@media (max-width: 860px)";
const start = css.indexOf(header);

if (start === -1) {
  console.log("block not found");
  process.exit(0);
}

const open = css.indexOf("{", start);
let depth = 0;
let end = -1;

for (let i = open; i < css.length; i += 1) {
  const ch = css[i];
  if (ch === "{") depth += 1;
  else if (ch === "}") {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}

if (end === -1) {
  console.log("unbalanced block");
  process.exit(1);
}

css = css.slice(0, start) + css.slice(end).replace(/^\s*\n/, "");
await writeFile(file, css);
console.log(`removed ${end - start} chars starting at ${start}`);
