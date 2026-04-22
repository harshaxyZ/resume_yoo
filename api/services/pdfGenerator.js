const { buildResumeHtml } = require('../templates/resume');

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      const puppeteer = require('puppeteer-core');
      const chromium = require('@sparticuz/chromium');
      
      // Optional: Increase timeout and adjust args for Vercel limits
      chromium.setGraphicsMode = false;
      
      browserInstance = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      const puppeteer = require('puppeteer');
      browserInstance = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
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
