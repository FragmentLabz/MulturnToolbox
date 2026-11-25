// ============================================================
//  Your tool's behaviour goes here.
//  This example just counts letters, so you can see the pattern:
//    1. grab the bits of the page you need
//    2. react when something is clicked or typed
//    3. show the result
// ============================================================

const input = document.getElementById("input");
const goButton = document.getElementById("go");
const output = document.getElementById("output");

goButton.addEventListener("click", () => {
  const text = input.value;
  output.textContent = `You typed ${text.length} characters.`;
});
