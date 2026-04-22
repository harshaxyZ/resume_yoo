const puppeteer = require('puppeteer');
const { buildResumeHtml } = require('../templates/resume');

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browserInstance;
}

async function generatePdf(resumeData, fontChoice = 'Inter') {
  const html = buildResumeHtml(resumeData, fontChoice);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    });

    return pdfBuffer;
  } finally {
    await page.close();
  }
}

// Cleanup on exit
process.on('SIGINT', async () => {
  if (browserInstance) await browserInstance.close();
  process.exit();
});

module.exports = { generatePdf };
