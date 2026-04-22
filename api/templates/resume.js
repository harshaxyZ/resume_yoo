function buildResumeHtml(data, font = 'Inter') {
  const fontMap = {
    'Inter': "'Inter', sans-serif",
    'Georgia': "'Georgia', serif",
    'Roboto Mono': "'Roboto Mono', monospace",
    'Playfair Display': "'Playfair Display', serif",
  };

  const fontFamily = fontMap[font] || fontMap['Inter'];

  const googleFont = font !== 'Georgia'
    ? `<link href="https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;600;700&display=swap" rel="stylesheet">`
    : '';

  const personal = data.personal || {};
  const contactParts = [
    personal.phone,
    personal.email,
    personal.github,
    personal.linkedin,
    personal.portfolio,
  ].filter(Boolean);

  const contactLine = contactParts.join(' | ');

  const educationHtml = (data.education || []).map(edu => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${edu.college || ''}</span>
        <span class="entry-date">${edu.year || ''}</span>
      </div>
      <div class="entry-subtitle">${edu.degree || ''}${edu.cgpa ? `, CGPA: ${edu.cgpa}` : ''}</div>
    </div>
  `).join('');

  const experienceHtml = (data.experience || []).map(exp => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${exp.role || ''}${exp.company ? ` @ ${exp.company}` : ''}</span>
        <span class="entry-date">${exp.start || ''}${exp.end ? ` – ${exp.end}` : ''}</span>
      </div>
      <ul>${(exp.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul>
    </div>
  `).join('');

  const projectsHtml = (data.projects || []).map(proj => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${proj.name || ''}${proj.techStack ? ` | ${proj.techStack}` : ''}${proj.github ? ` | ${proj.github}` : ''}</span>
      </div>
      <ul>${(proj.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul>
    </div>
  `).join('');

  const skills = data.skills || {};
  const skillLines = [];
  if (skills.languages) skillLines.push(`<strong>Languages:</strong> ${skills.languages}`);
  if (skills.frameworks) skillLines.push(`<strong>Frameworks:</strong> ${skills.frameworks}`);
  if (skills.tools) skillLines.push(`<strong>Tools:</strong> ${skills.tools}`);

  const achievementsHtml = (data.achievements || [])
    .filter(a => a && a.trim())
    .map(a => `<li>${a}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${googleFont}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${fontFamily};
      font-size: 11px;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 40px 50px;
      max-width: 800px;
      margin: 0 auto;
    }
    .name {
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .contact {
      text-align: center;
      font-size: 10px;
      color: #444;
      margin-bottom: 16px;
      word-break: break-all;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1.5px solid #1a1a1a;
      padding-bottom: 2px;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    .entry { margin-bottom: 8px; }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .entry-title { font-weight: 600; font-size: 11px; }
    .entry-date { font-size: 10px; color: #555; white-space: nowrap; }
    .entry-subtitle { font-size: 10.5px; color: #333; }
    ul {
      padding-left: 16px;
      margin-top: 2px;
    }
    li {
      margin-bottom: 1px;
      font-size: 10.5px;
    }
    .skills-line {
      font-size: 10.5px;
      margin-bottom: 2px;
    }
    .skills-line strong {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="name">${personal.name || ''}</div>
  <div class="contact">${contactLine}</div>

  ${educationHtml ? `<div class="section-title">Education</div>${educationHtml}` : ''}
  ${experienceHtml ? `<div class="section-title">Experience</div>${experienceHtml}` : ''}
  ${projectsHtml ? `<div class="section-title">Projects</div>${projectsHtml}` : ''}
  ${skillLines.length ? `<div class="section-title">Skills</div><div>${skillLines.map(s => `<div class="skills-line">${s}</div>`).join('')}</div>` : ''}
  ${achievementsHtml ? `<div class="section-title">Achievements</div><ul>${achievementsHtml}</ul>` : ''}
</body>
</html>`;
}

module.exports = { buildResumeHtml };
