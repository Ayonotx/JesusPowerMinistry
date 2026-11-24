import { readFile, writeFile } from "node:fs/promises";

const src = process.argv[2];
const data = JSON.parse(await readFile(src, "utf8"));
const events = Array.isArray(data.events) ? data.events : [];

const ID = "birthday60-2026";
const exists = events.some((e) => e.id === ID);

if (!exists) {
  events.push({
    id: ID,
    title: "60th birthday celebration of Pastor Stephen Asankoma Koomson (PhD)",
    date: "2026-10-31",
    category: "milestone",
    description:
      "Family, friends and well-wishers gathered at Grace Centre to honour Pastor Stephen Asankoma Koomson (PhD) on his 60th birthday.",
    image: "assets/img/uploads/birthday-60-koomson.jpg",
    published: true,
    featured: false,
  });
}

await writeFile("data/events.json", JSON.stringify({ events }, null, 2) + "\n");
console.log(exists ? "already present" : "added", "·", events.length, "events");
