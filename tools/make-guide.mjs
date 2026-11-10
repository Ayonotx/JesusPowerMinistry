/**
 * Builds the staff guide deck: JPSMRC-Website-Admin-Guide.pptx
 *   node tools/make-guide.mjs
 */
import pptxgen from "pptxgenjs";

const NAVY = "14203A";
const NAVY_SOFT = "233556";
const GOLD = "B08D4F";
const CREAM = "FBF9F4";
const WARM = "F4F0E7";
const WHITE = "FFFFFF";
const INK = "1C2430";
const MUTED = "4C5766";
const LINE = "E3DED2";

const HEAD = "Georgia";
const BODY = "Segoe UI";

const pptx = new pptxgen();
pptx.defineLayout({ name: "WIDE_16_9", width: 13.333, height: 7.5 });
pptx.layout = "WIDE_16_9";
pptx.author = "Jesus Power School of Ministry & Retreat Center";
pptx.company = "JPSMRC";
pptx.title = "Website Admin — Staff Guide";
pptx.subject = "How to update the website";

const W = 13.333;
const H = 7.5;
const M = 0.75;

let pageNo = 0;

function base(title, kicker) {
  const slide = pptx.addSlide();
  slide.background = { color: CREAM };
  pageNo += 1;

  // top rule
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.09, fill: { color: NAVY } });

  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: M, y: 0.42, w: 8, h: 0.3,
      fontFace: BODY, fontSize: 10, bold: true, color: GOLD, charSpacing: 2,
    });
  }

  slide.addText(title, {
    x: M, y: 0.72, w: W - M * 2, h: 0.75,
    fontFace: HEAD, fontSize: 30, bold: true, color: NAVY,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: M, y: 1.52, w: 1.1, h: 0.045, fill: { color: GOLD },
  });

  slide.addText(String(pageNo), {
    x: W - 0.85, y: H - 0.52, w: 0.55, h: 0.3,
    fontFace: BODY, fontSize: 9, color: MUTED, align: "right",
  });

  slide.addText("Jesus Power School of Ministry & Retreat Center", {
    x: M, y: H - 0.52, w: 7, h: 0.3,
    fontFace: BODY, fontSize: 8, color: "9AA3B0",
  });

  return slide;
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: opts.fill || WHITE },
    line: { color: opts.line || LINE, width: 1 },
  });
}

function step(slide, n, x, y, w, heading, body) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y: y + 0.03, w: 0.42, h: 0.42,
    fill: { color: GOLD }, line: { color: GOLD, width: 0 },
  });
  slide.addText(String(n), {
    x, y: y + 0.03, w: 0.42, h: 0.42,
    fontFace: BODY, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle",
  });
  slide.addText(heading, {
    x: x + 0.6, y, w: w - 0.6, h: 0.3,
    fontFace: BODY, fontSize: 14, bold: true, color: INK,
  });
  slide.addText(body, {
    x: x + 0.6, y: y + 0.3, w: w - 0.6, h: 0.45,
    fontFace: BODY, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.1,
  });
}

function pill(slide, x, y, w, label, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.42, rectRadius: 0.21,
    fill: { color: opts.fill || WARM },
    line: { color: opts.line || LINE, width: 1 },
  });
  slide.addText(label, {
    x, y, w, h: 0.42,
    fontFace: BODY, fontSize: 10.5, bold: true,
    color: opts.color || MUTED, align: "center", valign: "middle",
  });
}

/* 1 — Cover --------------------------------------------------------------- */
{
  const s = pptx.addSlide();
  s.background = { color: NAVY };

  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.14, h: H, fill: { color: GOLD } });

  s.addText("WEBSITE ADMINISTRATION", {
    x: 1.0, y: 1.5, w: 6, h: 0.3,
    fontFace: BODY, fontSize: 11, bold: true, color: GOLD, charSpacing: 3,
  });

  s.addText("Staff guide to\nupdating the website", {
    x: 1.0, y: 1.95, w: 8.4, h: 1.7,
    fontFace: HEAD, fontSize: 44, bold: true, color: WHITE, lineSpacingMultiple: 1.02,
  });

  s.addShape(pptx.ShapeType.rect, { x: 1.0, y: 3.85, w: 1.4, h: 0.05, fill: { color: GOLD } });

  s.addText(
    "Events, photographs, announcements and your password — without touching any code.",
    { x: 1.0, y: 4.1, w: 7.6, h: 0.8, fontFace: BODY, fontSize: 14, color: "C9D2E0", lineSpacingMultiple: 1.25 }
  );

  s.addText("Jesus Power School of Ministry & Retreat Center  ·  jesuspowersmrc.org", {
    x: 1.0, y: 6.45, w: 10, h: 0.3,
    fontFace: BODY, fontSize: 10, color: "8794A8",
  });
}

/* 2 — What you can update ------------------------------------------------ */
{
  const s = base("What you can update", "Overview");

  s.addText(
    "The panel is deliberately small. If it is not on this page, it needs a developer.",
    { x: M, y: 1.72, w: 10.5, h: 0.4, fontFace: BODY, fontSize: 12.5, color: MUTED }
  );

  const items = [
    ["Events", "Add, edit or remove dates and intake information."],
    ["Photographs", "Upload pictures and caption them in the Gallery."],
    ["Announcements", "A short notice strip on the home page."],
    ["Your password", "Change it yourself at any time."],
  ];

  items.forEach(([heading, body], i) => {
    const x = M + i * 3.02;
    card(s, x, 2.35, 2.78, 2.05);
    s.addShape(pptx.ShapeType.rect, { x, y: 2.35, w: 0.06, h: 2.05, fill: { color: GOLD } });
    s.addText(heading, {
      x: x + 0.25, y: 2.55, w: 2.35, h: 0.35,
      fontFace: BODY, fontSize: 14, bold: true, color: NAVY,
    });
    s.addText(body, {
      x: x + 0.25, y: 2.95, w: 2.35, h: 1.1,
      fontFace: BODY, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.2,
    });
  });

  card(s, M, 4.75, W - M * 2, 1.05, { fill: WARM, line: LINE });
  s.addText("Two rules that save everyone time", {
    x: M + 0.3, y: 4.9, w: 5, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY,
  });
  s.addText(
    "1.  Only publish information that has been approved by the ministry office.\n2.  Always sign out on a shared computer.",
    { x: M + 0.3, y: 5.2, w: W - M * 2 - 0.6, h: 0.6, fontFace: BODY, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.25 }
  );
}

/* 3 — Sign in ------------------------------------------------------------- */
{
  const s = base("Signing in", "Step 1");

  card(s, M, 1.85, 6.4, 1.25, { fill: NAVY, line: NAVY });
  s.addText("https://jesuspowersmrc.org/admin/", {
    x: M + 0.35, y: 1.98, w: 5.7, h: 0.35,
    fontFace: BODY, fontSize: 11, color: "C9D2E0",
  });
  s.addText("jesuspowersmrc.org/admin", {
    x: M + 0.35, y: 2.3, w: 5.7, h: 0.55,
    fontFace: BODY, fontSize: 24, bold: true, color: WHITE,
  });

  step(s, 1, M, 3.45, 6.4, "Open the address above", "Use any browser — phone, tablet or computer.");
  step(s, 2, M, 4.3, 6.4, "Enter your username and password", "Both are given to you by the office manager.");
  step(s, 3, M, 5.15, 6.4, "Click “Sign in”", "You will land on the Dashboard.");

  card(s, 7.6, 1.85, 4.98, 2.5);
  s.addText("First time?", { x: 7.9, y: 2.0, w: 4.4, h: 0.3, fontFace: BODY, fontSize: 13, bold: true, color: NAVY });
  s.addText(
    "Change your password straight away: Account → Change your password.\n\nDo not keep the temporary password that was given to you.",
    { x: 7.9, y: 2.35, w: 4.4, h: 1.5, fontFace: BODY, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.25 }
  );

  card(s, 7.6, 4.55, 4.98, 1.55, { fill: WARM, line: LINE });
  s.addText("Security note", { x: 7.9, y: 4.7, w: 4.4, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY });
  s.addText(
    "Five wrong passwords locks sign-in for 15 minutes. That is normal — wait, then try again.",
    { x: 7.9, y: 5.02, w: 4.4, h: 0.9, fontFace: BODY, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.2 }
  );

  s.addText("Always check the address starts with https:// and the padlock is showing.", {
    x: M, y: 6.2, w: 11, h: 0.3, fontFace: BODY, fontSize: 10, italic: true, color: "7A8595",
  });
}

/* 4 — Dashboard ----------------------------------------------------------- */
{
  const s = base("The dashboard", "Step 2");

  // Sidebar mock
  s.addShape(pptx.ShapeType.rect, { x: M, y: 1.85, w: 2.45, h: 3.75, fill: { color: NAVY } });
  s.addText("JPSMRC", { x: M + 0.22, y: 2.0, w: 2, h: 0.3, fontFace: BODY, fontSize: 13, bold: true, color: WHITE });
  s.addText("CONTENT ADMIN", { x: M + 0.22, y: 2.26, w: 2, h: 0.25, fontFace: BODY, fontSize: 7, bold: true, color: "8794A8", charSpacing: 1.5 });

  ["Dashboard", "Events", "Photos", "Announcements", "Account"].forEach((label, i) => {
    const y = 2.7 + i * 0.5;
    if (i === 0) {
      s.addShape(pptx.ShapeType.roundRect, {
        x: M + 0.12, y: y - 0.06, w: 2.2, h: 0.42, rectRadius: 0.06,
        fill: { color: "2A3B5E" }, line: { color: "2A3B5E", width: 0 },
      });
    }
    s.addText(label, {
      x: M + 0.26, y: y - 0.02, w: 2, h: 0.3,
      fontFace: BODY, fontSize: 11, color: i === 0 ? GOLD : "C0CAD8",
    });
  });

  s.addText("The sidebar is always there. Tap an item to switch section.", {
    x: M, y: 5.72, w: 2.6, h: 0.5, fontFace: BODY, fontSize: 9, color: MUTED,
  });

  // Counters
  const stats = ["Events", "Gallery photos", "Announcements"];
  stats.forEach((label, i) => {
    const x = 3.55 + i * 3.05;
    card(s, x, 1.85, 2.85, 1.15);
    s.addText(label.toUpperCase(), {
      x: x + 0.22, y: 1.98, w: 2.4, h: 0.25, fontFace: BODY, fontSize: 7.5, bold: true, color: "7A8595", charSpacing: 1.2,
    });
    s.addText(String([7, 0, 0][i]), {
      x: x + 0.22, y: 2.2, w: 1.2, h: 0.5, fontFace: BODY, fontSize: 24, bold: true, color: NAVY,
    });
  });

  // Quick actions
  card(s, 3.55, 3.2, 8.5, 1.15);
  s.addText("What do you want to do?", {
    x: 3.8, y: 3.32, w: 4, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY,
  });
  ["Add an event", "Upload photos", "New announcement", "Change password"].forEach((label, i) => {
    pill(s, 3.8 + i * 2.02, 3.72, 1.92, label, i === 0 ? { fill: NAVY, line: NAVY, color: WHITE } : {});
  });

  // System check
  card(s, 3.55, 4.55, 8.5, 1.05, { fill: WARM, line: LINE });
  s.addText("System check", { x: 3.8, y: 4.67, w: 4, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY });
  s.addText(
    "All green = the site can save your changes. A red item means call the site administrator.",
    { x: 3.8, y: 4.98, w: 7.9, h: 0.5, fontFace: BODY, fontSize: 10.5, color: MUTED }
  );
}

/* 5 — Add an event -------------------------------------------------------- */
{
  const s = base("Add an event", "Events");

  step(s, 1, M, 1.8, 6.1, "Events → “Add event”", "In the left sidebar.");
  step(s, 2, M, 2.55, 6.1, "Type the title", "Required. This is the heading visitors see.");
  step(s, 3, M, 3.3, 6.1, "Pick a date — or skip it", "No date? Put a label such as “Community outreach”.");
  step(s, 4, M, 4.05, 6.1, "Add a short description", "One or two sentences is plenty.");
  step(s, 5, M, 4.8, 6.1, "Attach a photograph (optional)", "JPEG, PNG or WebP, up to 8 MB.");
  step(s, 6, M, 5.55, 6.1, "Tick “Published” → Save event", "Untick it to keep a draft.");

  card(s, 7.3, 1.8, 5.25, 2.6, { fill: NAVY, line: NAVY });
  s.addText("Where it appears", {
    x: 7.6, y: 1.95, w: 4.6, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: GOLD,
  });
  s.addText(
    "•  Straight away on the Events page\n•  The three newest on the home page\n•  No waiting, no republishing",
    { x: 7.6, y: 2.32, w: 4.6, h: 1.4, fontFace: BODY, fontSize: 11.5, color: "D7DEE8", lineSpacingMultiple: 1.45 }
  );

  card(s, 7.3, 4.6, 5.25, 1.5);
  s.addText("Editing or deleting", {
    x: 7.6, y: 4.72, w: 4.6, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY,
  });
  s.addText(
    "The Events list has Edit and Delete next to every row. Deleting asks for confirmation.",
    { x: 7.6, y: 5.05, w: 4.6, h: 0.8, fontFace: BODY, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.2 }
  );
}

/* 6 — Event fields -------------------------------------------------------- */
{
  const s = base("Event form — what each field does", "Events");

  const head = { bold: true, color: NAVY, fill: { color: WARM }, fontSize: 11.5 };
  const key = { bold: true, color: INK };

  const rows = [
    [{ text: "Field", options: head }, { text: "What to put there", options: head }],
    ["Title", "Required. The heading on the event card."],
    ["Date", "Optional. Use the calendar picker."],
    ["Date label", "Shown instead of a date, e.g. “Community outreach”."],
    ["Category", "School · Milestone · Outreach · Conference · General."],
    ["Description", "One or two sentences — about 200 characters."],
    ["Photograph", "Optional. Replacing it deletes the old file."],
    ["Published", "Tick to show it. Untick to keep it as a draft."],
    ["Featured", "Highlights the event on the home page."],
  ].map((row, i) => (i === 0 ? row : [{ text: row[0], options: key }, row[1]]));

  s.addTable(rows, {
    x: M, y: 1.8, w: W - M * 2,
    colW: [2.6, 9.2],
    border: { type: "solid", color: LINE, pt: 1 },
    fontFace: BODY,
    fontSize: 11.5,
    color: MUTED,
    valign: "middle",
    rowH: 0.48,
    autoPage: false,
  });

  s.addText(
    "Tip: leave the photo empty and the card still looks correct — it uses a plain colour block.",
    { x: M, y: 6.55, w: 11, h: 0.3, fontFace: BODY, fontSize: 10, italic: true, color: "7A8595" }
  );
}

/* 7 — Upload photos ------------------------------------------------------- */
{
  const s = base("Upload photographs", "Photos");

  step(s, 1, M, 1.8, 6.3, "Photos → choose Images", "You can select several files at once.");
  step(s, 2, M, 2.55, 6.3, "Add a caption (optional)", "e.g. “Graduation 2026”.");
  step(s, 3, M, 3.3, 6.3, "Choose a category", "This controls the Gallery filters.");
  step(s, 4, M, 4.05, 6.3, "Click Upload", "Large photos are resized automatically.");

  s.addText("Categories", {
    x: M, y: 5.0, w: 3, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY,
  });
  const cats = ["General", "Exterior", "Interior", "Nature", "Events", "School of Ministry", "Celebrations"];
  let cx = M;
  let cy = 5.38;
  cats.forEach((label) => {
    const w = 0.16 * label.length + 0.45;
    if (cx + w > 7.1) { cx = M; cy += 0.55; }
    pill(s, cx, cy, w, label);
    cx += w + 0.14;
  });

  card(s, 7.5, 1.8, 5.05, 2.55);
  s.addText("File rules", { x: 7.8, y: 1.95, w: 4.4, h: 0.3, fontFace: BODY, fontSize: 13, bold: true, color: NAVY });
  s.addText(
    "•  JPEG, PNG or WebP only\n•  Maximum 8 MB per photo\n•  At least 200 × 200 pixels\n•  HEIC from an iPhone must be\n    converted to JPEG first",
    { x: 7.8, y: 2.32, w: 4.4, h: 1.9, fontFace: BODY, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.5 }
  );

  card(s, 7.5, 4.65, 5.05, 1.05, { fill: WARM, line: LINE });
  s.addText(
    "Uploaded photos appear at the end of the Gallery. Use the matching filter to view them.",
    { x: 7.8, y: 4.8, w: 4.45, h: 0.75, fontFace: BODY, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.2 }
  );
}

/* 8 — Manage photos ------------------------------------------------------- */
{
  const s = base("Editing and removing photographs", "Photos");

  card(s, M, 1.85, 5.6, 3.6);
  s.addText("Under every photo you will find", {
    x: M + 0.3, y: 2.0, w: 5, h: 0.3, fontFace: BODY, fontSize: 12.5, bold: true, color: NAVY,
  });
  s.addText(
    "•  Caption — correct a typo or add a name\n•  Category — move it between Gallery filters\n•  Visible — untick to hide it without deleting\n•  Save — applies the caption and category\n•  Delete photo — removes the picture for good",
    { x: M + 0.3, y: 2.4, w: 5.0, h: 2.4, fontFace: BODY, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.55 }
  );

  card(s, 6.8, 1.85, 5.75, 3.6, { fill: NAVY, line: NAVY });
  s.addText("Deleting is permanent", {
    x: 7.1, y: 2.0, w: 5.2, h: 0.3, fontFace: BODY, fontSize: 12.5, bold: true, color: GOLD,
  });
  s.addText(
    "Deleting a photo removes the file from the website immediately. There is no recycle bin.\n\nIf you are unsure, untick “Visible” instead — that hides it and you can bring it back later.",
    { x: 7.1, y: 2.4, w: 5.1, h: 2.5, fontFace: BODY, fontSize: 11.5, color: "D7DEE8", lineSpacingMultiple: 1.4 }
  );

  s.addText(
    "Ask before publishing photographs of children or of anyone who has not agreed to appear on the website.",
    { x: M, y: 5.75, w: 11, h: 0.3, fontFace: BODY, fontSize: 10.5, italic: true, color: "7A8595" }
  );
}

/* 9 — Announcements ------------------------------------------------------- */
{
  const s = base("Announcements", "Home page");

  step(s, 1, M, 1.85, 6.4, "Announcements → the form", "At the top of the page.");
  step(s, 2, M, 2.6, 6.4, "Add a short title", "For example “September intake now open”.");
  step(s, 3, M, 3.35, 6.4, "Write one or two lines", "It is a strip, not an article.");
  step(s, 4, M, 4.1, 6.4, "Tick “Show on the home page” → Save", "It appears near the top of the home page.");

  card(s, 7.6, 1.85, 4.95, 2.4, { fill: WARM, line: LINE });
  s.addText("Only one at a time", {
    x: 7.9, y: 2.0, w: 4.4, h: 0.3, fontFace: BODY, fontSize: 12.5, bold: true, color: NAVY,
  });
  s.addText(
    "Tick a new announcement and the previous one switches off automatically.",
    { x: 7.9, y: 2.38, w: 4.35, h: 0.9, fontFace: BODY, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.25 }
  );

  card(s, 7.6, 4.45, 4.95, 1.5);
  s.addText("To remove it", {
    x: 7.9, y: 4.57, w: 4.4, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY,
  });
  s.addText(
    "Open it, untick “Show on the home page” and save. Or delete it entirely.",
    { x: 7.9, y: 4.9, w: 4.35, h: 0.8, fontFace: BODY, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.2 }
  );
}

/* 10 — Password ----------------------------------------------------------- */
{
  const s = base("Change your password", "Account");

  step(s, 1, M, 1.85, 6.3, "Click Account in the sidebar", "Bottom of the menu.");
  step(s, 2, M, 2.6, 6.3, "Type your current password", "The one you used to sign in.");
  step(s, 3, M, 3.35, 6.3, "Type the new password twice", "At least 10 characters.");
  step(s, 4, M, 4.1, 6.3, "Click “Update password”", "You stay signed in.");

  card(s, 7.5, 1.85, 5.05, 2.7);
  s.addText("Make it strong and memorable", {
    x: 7.8, y: 2.0, w: 4.4, h: 0.3, fontFace: BODY, fontSize: 12.5, bold: true, color: NAVY,
  });
  s.addText(
    "•  At least 10 characters\n•  Not used on another website\n•  Three or four unrelated words\n    make a good passphrase",
    { x: 7.8, y: 2.38, w: 4.4, h: 1.7, fontFace: BODY, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.5 }
  );

  card(s, 7.5, 4.75, 5.05, 1.15, { fill: NAVY, line: NAVY });
  s.addText(
    "Never send your password in a group chat, and never write it on the office noticeboard.",
    { x: 7.8, y: 4.92, w: 4.45, h: 0.8, fontFace: BODY, fontSize: 10.5, color: "D7DEE8", lineSpacingMultiple: 1.3 }
  );
}

/* 11 — Troubleshooting ---------------------------------------------------- */
{
  const s = base("If something goes wrong", "Help");

  const head = { bold: true, color: NAVY, fill: { color: WARM }, fontSize: 11 };
  const situation = { bold: true, color: INK };

  const rows = [
    [{ text: "What you see", options: head }, { text: "What to do", options: head }],
    ["“Incorrect username or password”", "Check capital letters and spacing. After five tries, wait 15 minutes."],
    ["You have forgotten the password", "There is no self-service reset — contact the site administrator."],
    ["“Images must be smaller than 8 MB”", "Send a smaller copy, or crop the photo first."],
    ["“Only JPEG, PNG and WebP”", "Convert the file. iPhone HEIC photos must be exported as JPEG."],
    ["A change is not showing", "Refresh with Ctrl + F5. Check “Published” is ticked."],
    ["The page looks broken", "Refresh. If it is still broken, send a screenshot to the administrator."],
  ].map((row, i) => (i === 0 ? row : [{ text: row[0], options: situation }, row[1]]));

  s.addTable(rows, {
    x: M, y: 1.8, w: W - M * 2,
    colW: [4.4, 7.4],
    border: { type: "solid", color: LINE, pt: 1 },
    fontFace: BODY,
    fontSize: 11,
    color: MUTED,
    valign: "middle",
    rowH: 0.62,
    autoPage: false,
  });
}

/* 12 — Closing ------------------------------------------------------------ */
{
  const s = pptx.addSlide();
  s.background = { color: NAVY };

  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.14, h: H, fill: { color: GOLD } });

  s.addText("QUICK REFERENCE", {
    x: 1.0, y: 1.15, w: 6, h: 0.3,
    fontFace: BODY, fontSize: 11, bold: true, color: GOLD, charSpacing: 3,
  });

  s.addText("Sign in at", {
    x: 1.0, y: 1.62, w: 4, h: 0.3, fontFace: BODY, fontSize: 12, color: "8794A8",
  });
  s.addText("jesuspowersmrc.org/admin", {
    x: 1.0, y: 1.92, w: 10, h: 0.55, fontFace: BODY, fontSize: 26, bold: true, color: WHITE,
  });

  s.addShape(pptx.ShapeType.rect, { x: 1.0, y: 2.75, w: 10.6, h: 0.01, fill: { color: "2A3B5E" } });

  const cols = [
    ["Events", "Add · edit · delete"],
    ["Photos", "Upload · caption · delete"],
    ["Announcements", "One banner at a time"],
    ["Account", "Change your password"],
  ];
  cols.forEach(([heading, body], i) => {
    const x = 1.0 + i * 2.85;
    s.addText(heading, { x, y: 3.05, w: 2.6, h: 0.3, fontFace: BODY, fontSize: 13, bold: true, color: GOLD });
    s.addText(body, { x, y: 3.38, w: 2.6, h: 0.6, fontFace: BODY, fontSize: 10.5, color: "C9D2E0", lineSpacingMultiple: 1.2 });
  });

  s.addText(
    "Keep this slide. Everything in this guide works from those four sections.",
    { x: 1.0, y: 4.45, w: 10, h: 0.35, fontFace: BODY, fontSize: 11, italic: true, color: "8794A8" }
  );

  s.addText("Jesus Power School of Ministry & Retreat Center  ·  Grace Centre, Dawhenya", {
    x: 1.0, y: 6.45, w: 10, h: 0.3, fontFace: BODY, fontSize: 10, color: "8794A8",
  });
}

await pptx.writeFile({ fileName: "JPSMRC-Website-Admin-Guide.pptx" });
console.log("written: JPSMRC-Website-Admin-Guide.pptx");
