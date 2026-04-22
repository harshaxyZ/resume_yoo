const pdfParse = require('pdf-parse');

async function parsePdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    console.error('PDF parse error:', err.message);
    throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF.');
  }
}

module.exports = { parsePdf };
