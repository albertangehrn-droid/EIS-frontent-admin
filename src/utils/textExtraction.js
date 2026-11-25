/**
 * Text Extraction Utility for React Elements
 * Handles extraction of text content from React components for speech synthesis
 * Can be used across multiple routes including /mission and /gameMission
 */

/**
 * Extract text from React elements, arrays, strings, and other data types
 * @param {*} element - The element to extract text from
 * @returns {string} - Extracted text content
 */
export const extractTextFromElement = (element) => {
  // Handle null/undefined
  if (element === null || element === undefined) {
    return '';
  }

  // Handle strings and numbers
  if (typeof element === 'string' || typeof element === 'number') {
    return element.toString();
  }

  // Handle arrays
  if (Array.isArray(element)) {
    return element
      .map(extractTextFromElement)
      .filter(text => text && text.trim() !== '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Handle React elements with props
  if (element && typeof element === 'object') {
    // Check if it's a React element with props
    if (element.props) {
      const { children, dangerouslySetInnerHTML } = element.props;
      
      // Handle dangerouslySetInnerHTML
      if (dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html) {
        // Strip HTML tags and get text
        return dangerouslySetInnerHTML.__html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      
      // Handle children
      if (children !== undefined && children !== null) {
        return extractTextFromElement(children);
      }
      
      return '';
    }
    
    // Handle React Fragment or any React element
    if (element.$$typeof) {
      // Try to extract from fragment children
      if (element.props && element.props.children) {
        return extractTextFromElement(element.props.children);
      }
    }
    
    // Handle plain objects with common text properties
    if (element.text) return extractTextFromElement(element.text);
    if (element.content) return extractTextFromElement(element.content);
    if (element.label) return extractTextFromElement(element.label);
    if (element.title) return extractTextFromElement(element.title);
    if (element.description) return extractTextFromElement(element.description);
  }

  return '';
};

/**
 * Special function to extract text from mission data content
 * @param {*} content - Mission content (usually React Fragment)
 * @returns {string} - Extracted text
 */
export const extractMissionContentText = (content) => {
  if (!content) return '';
  
  console.log('extractMissionContentText called with:', content);
  console.log('Content type:', typeof content);
  console.log('Content props:', content.props);
  
  // If it's a React element with children
  if (content && content.props && content.props.children) {
    const children = content.props.children;
    console.log('Children:', children);
    console.log('Children type:', typeof children);
    console.log('Is array?', Array.isArray(children));
    
    if (Array.isArray(children)) {
      console.log('Processing children array...');
      const extractedText = children
        .map(child => {
          console.log('Processing child:', child);
          if (child && child.props && child.props.children) {
            return extractTextFromElement(child.props.children);
          }
          return extractTextFromElement(child);
        })
        .filter(text => text && text.trim() !== '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('Extracted text from array:', extractedText);
      return extractedText;
    } else {
      const extractedText = extractTextFromElement(children);
      console.log('Extracted text from single child:', extractedText);
      return extractedText;
    }
  }
  
  // Fallback to regular extraction
  const fallbackText = extractTextFromElement(content);
  console.log('Fallback extracted text:', fallbackText);
  return fallbackText;
};

/**
 * Clean and format text for better speech synthesis
 * @param {string} text - Raw text to clean
 * @returns {string} - Cleaned text ready for speech
 */
export const cleanTextForSpeech = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Convert HTML entities to actual characters
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    
    // Handle common abbreviations and special cases for better speech
    .replace(/\bAI\b/g, 'A.I.')
    .replace(/\bAI\.\b/g, 'A.I.')
    .replace(/\bGlobeCom\b/g, 'Globe Com')
    .replace(/\bFrontMedia\b/g, 'Front Media')
    .replace(/\bBoost AI\b/g, 'Boost A.I.')
    .replace(/\b6 months\b/g, 'six months')
    .replace(/\b120 days\b/g, 'one hundred twenty days')
    .replace(/\b24 members\b/g, 'twenty four members')
    
    // Clean up whitespace and formatting
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/\s*\.\s*/g, '. ')  // Ensure proper spacing after periods
    .replace(/\s*,\s*/g, ', ')    // Ensure proper spacing after commas
    .replace(/\s*;\s*/g, '; ')    // Ensure proper spacing after semicolons
    
    // Remove extra spaces around parentheses and quotes
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ')
    .replace(/\s*"\s*/g, '"')
    .replace(/\s*'\s*/g, "'")
    
    .trim();
};

/**
 * Extract and clean text from React elements in one step
 * @param {*} element - React element to extract text from
 * @returns {string} - Cleaned text ready for speech
 */
export const getTextForSpeech = (element) => {
  const extractedText = extractTextFromElement(element);
  return cleanTextForSpeech(extractedText);
};

/**
 * Extract text from mission section data
 * @param {Object} section - Mission section object with label and content
 * @returns {string} - Complete text for speech including label and content
 */
export const getMissionSectionText = (section) => {
  if (!section) {
    console.log('getMissionSectionText: No section provided');
    return '';
  }
  
  const labelText = section.label || '';
  const contentText = extractMissionContentText(section.content || '');
  
  console.log('getMissionSectionText debug:');
  console.log('- Label:', labelText);
  console.log('- Content type:', typeof section.content);
  console.log('- Content:', section.content);
  console.log('- Extracted content text:', contentText);
  console.log('- Content text length:', contentText.length);
  
  const fullText = `${labelText}. ${contentText}`;
  const cleanedText = cleanTextForSpeech(fullText);
  
  console.log('- Full text length:', cleanedText.length);
  console.log('- Full text preview:', cleanedText.substring(0, 100) + '...');
  
  return cleanedText;
};

/**
 * Split long text into smaller chunks for better speech synthesis
 * @param {string} text - Long text to split
 * @param {number} maxLength - Maximum length per chunk (default 200)
 * @returns {string[]} - Array of text chunks
 */
export const splitTextForSpeech = (text, maxLength = 200) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // If text is short enough, return as single chunk
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  const sentences = text.split(/[.!?]+/); // Split by sentence endings
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // If adding this sentence would exceed max length, start new chunk
    if (currentChunk && (currentChunk.length + trimmedSentence.length + 1) > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim() + '.');
      }
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim() + '.');
  }
  
  return chunks.filter(chunk => chunk.trim() !== '');
};

export default {
  extractTextFromElement,
  cleanTextForSpeech,
  getTextForSpeech,
  getMissionSectionText,
  splitTextForSpeech
};
