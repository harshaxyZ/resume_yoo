const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeJobDescription(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, nav, footer, header, iframe, noscript').remove();

    // Try common JD selectors across job platforms
    const selectors = [
      // Naukri
      '.styles_JDC__dang-inner-html__h0K4t',
      '.job-desc',
      '.jd-container',
      // LinkedIn
      '.description__text',
      '.show-more-less-html__markup',
      // Indeed
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      // Generic
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[class*="job_description"]',
      '[id*="job-description"]',
      '[id*="jobDescription"]',
      'article',
      '.content',
      'main',
    ];

    let jdText = '';

    for (const selector of selectors) {
      const el = $(selector);
      if (el.length && el.text().trim().length > 100) {
        jdText = el.text().trim();
        break;
      }
    }

    // Fallback: grab body text
    if (!jdText || jdText.length < 100) {
      jdText = $('body').text().trim();
    }

    // Clean up whitespace
    jdText = jdText.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    if (jdText.length < 50) {
      throw new Error('Could not extract meaningful job description from this URL.');
    }

    // Limit to reasonable length
    return jdText.substring(0, 5000);
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 401) {
      throw new Error('This website blocked our access. Please copy-paste the job description manually.');
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again or paste the job description manually.');
    }
    throw new Error(err.message || 'Failed to scrape job description. Please paste it manually.');
  }
}

module.exports = { scrapeJobDescription };
