export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase() // Convert title to lowercase
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^\w\-]+/g, '') // Remove non-word characters
    .replace(/\-\+/g, '-') // Replace multiple consecutive dashes with a single dash
    .replace(/^\-+/, '') // Remove dashes from the start
    .replace(/\-+$/, ''); // Remove dashes from the end
  return slug;
}
