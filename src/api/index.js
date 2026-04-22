const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Something went wrong');
  }
  return res;
}

export async function parseResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request('/parse-resume', { method: 'POST', body: formData });
  return res.json();
}

export async function analyseAts(resumeText) {
  const res = await request('/analyse/ats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText }),
  });
  return res.json();
}

export async function analyseWeakness(resumeText) {
  const res = await request('/analyse/weakness', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText }),
  });
  return res.json();
}

export async function tailorResume(resumeText, jdText) {
  const res = await request('/analyse/tailor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jdText }),
  });
  return res.json();
}

export async function editResume(resumeText, instruction) {
  const res = await request('/analyse/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, instruction }),
  });
  return res.json();
}

export async function scrapeJd(url) {
  const res = await request('/scrape-jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function generatePdf(resumeData, fontChoice) {
  const res = await request('/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, fontChoice }),
  });
  return res.blob();
}

export async function parseStructured(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request('/parse-structured', { method: 'POST', body: formData });
  return res.json();
}

export function downloadBlob(blob, filename = 'resume.pdf') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
