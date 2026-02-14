export const calculateReadingTime = (text: string): number => {
  // Average reading speed is 200-250 words per minute
  // We'll use 225 words per minute as the average
  const wordsPerMinute = 225;
  
  // Count words in the text
  const words = text.trim().split(/\s+/).length;
  
  // Calculate reading time in minutes
  const readingTime = Math.ceil(words / wordsPerMinute);
  
  // Minimum reading time should be 1 minute
  return Math.max(1, readingTime);
};

export const formatReadingTime = (minutes: number): string => {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
};