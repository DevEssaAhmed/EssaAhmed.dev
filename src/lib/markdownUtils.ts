/**
 * Extracts plain text from markdown content
 * Removes markdown syntax and returns clean text
 */
export function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // Remove headers (# ## ### etc)
  let text = markdown.replace(/^#{1,6}\s+/gm, '');
  
  // Remove bold and italic markers
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  text = text.replace(/_{1,3}([^_]+)_{1,3}/g, '$1');
  
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  
  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');
  
  // Remove horizontal rules
  text = text.replace(/^---+$/gm, '');
  text = text.replace(/^\*\*\*+$/gm, '');
  
  // Remove list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // Remove tables
  text = text.replace(/\|[^\n]+\|/g, '');
  
  // Remove extra whitespace and newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();
  
  return text;
}

/**
 * Gets the first N characters of text from markdown
 * Returns a clean excerpt without markdown syntax
 */
export function getMarkdownExcerpt(markdown: string, maxLength: number = 150): string {
  const plainText = extractTextFromMarkdown(markdown);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Try to cut at a sentence boundary
  const truncated = plainText.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength * 0.8) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Gets the first paragraph from markdown content
 */
export function getFirstParagraph(markdown: string): string {
  if (!markdown) return '';
  
  // Split by double newlines to get paragraphs
  const paragraphs = markdown.split(/\n\n+/);
  
  // Find the first non-header paragraph
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    // Skip headers, lists, code blocks, etc.
    if (!trimmed.startsWith('#') && 
        !trimmed.startsWith('```') && 
        !trimmed.startsWith('- ') && 
        !trimmed.startsWith('* ') && 
        !trimmed.startsWith('> ') &&
        !trimmed.match(/^\d+\.\s/) &&
        trimmed.length > 20) {
      return extractTextFromMarkdown(trimmed);
    }
  }
  
  // If no suitable paragraph found, return excerpt from the whole content
  return getMarkdownExcerpt(markdown, 150);
}
