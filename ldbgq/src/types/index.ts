export interface LdbEntry {
  id: string;
  offset: number;
  content: string;
  rawHex: string; // Added for verification
  size: number;
  type: 'JSON' | 'URL' | 'Number' | 'Text' | 'Binary';
}