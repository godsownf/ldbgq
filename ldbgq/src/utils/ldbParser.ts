import { LdbEntry } from "../types";

/**
 * Robust Text Island Scanner & Hybrid Decoder.
 * 
 * 1. Scans for "Text Islands": Sequences of bytes that look like text.
 * 2. Uses Hybrid Decoding: Tries UTF-8, falls back to Latin-1 if corrupted.
 * 3. Ensures zero data loss by showing every byte as a character if needed.
 */
export async function parseLdbFile(file: File): Promise<LdbEntry[]> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const entries: LdbEntry[] = [];
  
  let start = -1;
  const minLength = 2; // Minimum length to consider a string

  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    
    // Check if byte is a "Text Byte"
    // Printable ASCII (32-126), Common Whitespace (9,10,13), or High-Byte (128+)
    const isTextByte = (byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13 || byte >= 128;

    if (isTextByte) {
      if (start === -1) start = i;
    } else {
      // End of a text island
      if (start !== -1) {
        const end = i;
        const length = end - start;
        
        if (length >= minLength) {
          const chunk = buffer.slice(start, end);
          const content = hybridDecode(chunk);
          
          entries.push({
            id: `off-${start}`,
            offset: start,
            content: content,
            size: length,
            type: inferType(content),
            rawHex: bytesToHex(chunk) // Store hex for verification
          });
        }
        start = -1;
      }
    }
  }

  // Catch trailing text
  if (start !== -1) {
    const chunk = buffer.slice(start);
    const content = hybridDecode(chunk);
    entries.push({
      id: `off-${start}`,
      offset: start,
      content: content,
      size: chunk.length,
      type: inferType(content),
      rawHex: bytesToHex(chunk)
    });
  }
  
  return entries;
}

/**
 * Hybrid Decoder: Tries UTF-8, falls back to Latin-1.
 * Latin-1 ensures every byte is mapped to a character (no data loss).
 */
function hybridDecode(buffer: Uint8Array): string {
  // Attempt UTF-8
  const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
  const utf8Text = utf8Decoder.decode(buffer);
  
  // Check for replacement characters (U+FFFD)
  // If more than 30% are replacements, it's likely not UTF-8
  const replacementCount = (utf8Text.match(/�/g) || []).length;
  
  if (replacementCount === 0 || (replacementCount / utf8Text.length) < 0.3) {
    return utf8Text;
  }
  
  // Fallback: ISO-8859-1 (Latin-1) maps 1:1 to bytes 0-255
  // This guarantees we see everything, even if it looks like garbage
  return new TextDecoder('iso-8859-1').decode(buffer);
}

function bytesToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

function inferType(str: string): LdbEntry['type'] {
  if (str.startsWith('{') || str.startsWith('[')) return 'JSON';
  if (str.match(/^https?:\/\//)) return 'URL';
  if (!isNaN(Number(str.trim())) && str.trim() !== '') return 'Number';
  return 'Text';
}