export function generateSlug(text: string): string {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading/trailing spaces
    .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word characters with hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
