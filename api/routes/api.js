const express = require('express');
const multer = require('multer');
const { parsePdf } = require('../services/parser');
const { analyseAts, analyseWeakness, tailorResume, editResume, parseResumeToStructured } = require('../services/ai');
const { scrapeJobDescription } = require('../services/scraper');
const { generatePdf } = require('../services/pdfGenerator');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Parse resume PDF → text
router.post('/parse-resume', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const text = await parsePdf(req.file.buffer);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ATS Score
router.post('/analyse/ats', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required.' });
    const result = await analyseAts(resumeText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyse resume. Please try again.' });
  }
});

// Weakness Check
router.post('/analyse/weakness', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required.' });
    const result = await analyseWeakness(resumeText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check weaknesses. Please try again.' });
  }
});

// Tailor to JD
router.post('/analyse/tailor', async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;
    if (!resumeText || !jdText) return res.status(400).json({ error: 'Resume text and job description are required.' });
    const result = await tailorResume(resumeText, jdText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to tailor resume. Please try again.' });
  }
});

// Edit Resume
router.post('/analyse/edit', async (req, res) => {
  try {
    const { resumeText, instruction } = req.body;
    if (!resumeText || !instruction) return res.status(400).json({ error: 'Resume text and instruction are required.' });
    const result = await editResume(resumeText, instruction);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit resume. Please try again.' });
  }
});

// Scrape JD from URL
router.post('/scrape-jd', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required.' });
    const jdText = await scrapeJobDescription(url);
    res.json({ jdText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF
router.post('/generate-pdf', async (req, res) => {
  try {
    const { resumeData, fontChoice } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'Resume data is required.' });
    const pdfBuffer = await generatePdf(resumeData, fontChoice || 'Inter');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF. Please try again.' });
  }
});

// Parse uploaded doc → structured data
router.post('/parse-structured', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const text = await parsePdf(req.file.buffer);
    const structured = await parseResumeToStructured(text);
    res.json(structured);
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse document. Please try again.' });
  }
});

module.exports = router;
