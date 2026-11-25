// ============================================================
//  THE TOOL LIST
//  This is the ONLY file you edit to put a new tool on the
//  home screen. Each tool is one { ... } block in the list.
//
//  name        → the title shown on the card
//  description → one short line under the title
//  icon        → any emoji
//  link        → path to the tool's page (inside the tools/ folder)
//  tags        → words people might search for (optional)
// ============================================================

const TOOLS = [
  {
    name: "Image ↔ PDF",
    description: "Turn PNG/JPG images into a PDF, or a PDF back into images.",
    icon: "🖼️",
    link: "tools/image-pdf/index.html",
    tags: ["png", "jpg", "jpeg", "pdf", "convert"],
  },

  // 👇 Your next tool goes here. Copy the block above, paste it
  //    below this line, and change the details. For example:
  //
  // {
  //   name: "Word Counter",
  //   description: "Count words and characters in any text.",
  //   icon: "🔢",
  //   link: "tools/word-counter/index.html",
  //   tags: ["text", "count"],
  // },
];
