const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function chat(systemPrompt, userMessage) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });
  return response.choices[0].message.content;
}

function extractJson(text) {
  // Try to find JSON in the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(raw);
}

async function analyseAts(resumeText) {
  const system = `You are an expert ATS (Applicant Tracking System) resume analyst. Analyse the resume and return a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "breakdown": {
    "keywords": { "score": <0-25>, "feedback": "<one line>" },
    "formatting": { "score": <0-25>, "feedback": "<one line>" },
    "impactLanguage": { "score": <0-25>, "feedback": "<one line>" },
    "length": { "score": <0-25>, "feedback": "<one line>" }
  },
  "summary": "<2-3 sentence overall assessment>"
}
Return ONLY the JSON, no other text.`;

  const result = await chat(system, `Analyse this resume:\n\n${resumeText}`);
  return extractJson(result);
}

async function analyseWeakness(resumeText) {
  const system = `You are a senior career coach and resume expert. Identify weaknesses in this resume. Return a JSON object with this exact structure:
{
  "weaknesses": [
    {
      "section": "<section name>",
      "issue": "<specific problem>",
      "original": "<the problematic text or 'Missing section'>",
      "suggestion": "<specific fix with rewritten text>"
    }
  ],
  "missingSections": ["<list of standard sections that are missing>"],
  "overallAdvice": "<2-3 sentences of general advice>"
}
Return ONLY the JSON, no other text.`;

  const result = await chat(system, `Review this resume:\n\n${resumeText}`);
  return extractJson(result);
}

async function tailorResume(resumeText, jdText) {
  const system = `You are an expert resume writer specializing in ATS optimization. Rewrite the resume to match the provided job description. 

Rules:
- Use strong action verbs from the JD
- Include high-value ATS keywords from the JD naturally
- Quantify achievements where possible
- Keep the same resume structure
- Return a JSON object with this exact structure:

{
  "personal": { "name": "", "phone": "", "email": "", "github": "", "linkedin": "", "portfolio": "" },
  "education": [{ "college": "", "degree": "", "cgpa": "", "year": "" }],
  "experience": [{ "role": "", "company": "", "start": "", "end": "", "bullets": [""] }],
  "projects": [{ "name": "", "techStack": "", "github": "", "bullets": [""] }],
  "skills": { "languages": "", "frameworks": "", "tools": "" },
  "achievements": [""]
}

Return ONLY the JSON, no other text.`;

  const result = await chat(system, `Resume:\n${resumeText}\n\nJob Description:\n${jdText}`);
  return extractJson(result);
}

async function editResume(resumeText, instruction) {
  const system = `You are an expert resume editor. Apply the user's instruction to modify the resume. 

Return the modified resume as a JSON object with this exact structure:
{
  "personal": { "name": "", "phone": "", "email": "", "github": "", "linkedin": "", "portfolio": "" },
  "education": [{ "college": "", "degree": "", "cgpa": "", "year": "" }],
  "experience": [{ "role": "", "company": "", "start": "", "end": "", "bullets": [""] }],
  "projects": [{ "name": "", "techStack": "", "github": "", "bullets": [""] }],
  "skills": { "languages": "", "frameworks": "", "tools": "" },
  "achievements": [""]
}

Apply ONLY the changes the user asked for. Keep everything else intact. Return ONLY the JSON, no other text.`;

  const result = await chat(system, `Resume:\n${resumeText}\n\nInstruction: ${instruction}`);
  return extractJson(result);
}

async function parseResumeToStructured(resumeText) {
  const system = `You are a resume data extractor. Parse the following resume text into a structured JSON format. Extract all available information.

Return a JSON object with this exact structure (use empty strings for missing fields):
{
  "personal": { "name": "", "phone": "", "email": "", "github": "", "linkedin": "", "portfolio": "" },
  "education": [{ "college": "", "degree": "", "cgpa": "", "year": "" }],
  "experience": [{ "role": "", "company": "", "start": "", "end": "", "bullets": [""] }],
  "projects": [{ "name": "", "techStack": "", "github": "", "bullets": [""] }],
  "skills": { "languages": "", "frameworks": "", "tools": "" },
  "achievements": [""]
}

Return ONLY the JSON, no other text.`;

  const result = await chat(system, `Parse this resume:\n\n${resumeText}`);
  return extractJson(result);
}

module.exports = {
  analyseAts,
  analyseWeakness,
  tailorResume,
  editResume,
  parseResumeToStructured,
};
