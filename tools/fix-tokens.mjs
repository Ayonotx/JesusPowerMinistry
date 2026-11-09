import { readFile, writeFile, readdir } from "node:fs/promises";

const map = [
  ["var(--text-light)", "var(--ink-600)"],
  ["var(--gold-dark)", "var(--gold-700)"],
  ["var(--gold-light)", "var(--gold-100)"],
  ["var(--text)", "var(--ink)"],
  ["var(--shadow-lg)", "var(--shadow-md)"],
  ["var(--shadow)", "var(--shadow-sm)"],
  ["var(--accent)", "var(--navy)"],
  ['style="background: var(--warm);"', 'class="section--warm"'],
  ['style="background: var(--cream);"', 'class=""'],
];

const files = (await readdir(".")).filter((f) => f.endsWith(".html"));
for (const f of files) {
  let s = await readFile(f, "utf8");
  const before = s;
  for (const [a, b] of map) s = s.split(a).join(b);
  if (s !== before) {
    await writeFile(f, s);
    console.log("fixed", f);
  }
}
