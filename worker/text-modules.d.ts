// Markdown imported as a Text module (wrangler.jsonc "rules").
declare module "*.md" {
  const text: string;
  export default text;
}
