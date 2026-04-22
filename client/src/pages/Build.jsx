import { useState } from 'react'
import FileUpload from '../components/FileUpload'
import ChipSelect from '../components/ChipSelect'
import FontSelector from '../components/FontSelector'
import { SkeletonText } from '../components/SkeletonLoader'
import * as api from '../api'

const STEPS = {
  ENTRY: 'entry',
  QA: 'qa',
  FONT: 'font',
  DONE: 'done',
}

const EMPTY_DATA = {
  personal: { name: '', phone: '', email: '', github: '', linkedin: '', portfolio: '' },
  education: [{ college: '', degree: '', cgpa: '', year: '' }],
  experience: [{ role: '', company: '', start: '', end: '', bullets: [''] }],
  projects: [{ name: '', techStack: '', github: '', bullets: [''] }],
  skills: { languages: '', frameworks: '', tools: '' },
  achievements: [''],
}

const QA_SECTIONS = [
  {
    key: 'personal',
    title: 'Personal Information',
    fields: [
      { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
      { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
      { key: 'email', label: 'Email', placeholder: 'john@example.com' },
      { key: 'github', label: 'GitHub URL', placeholder: 'github.com/johndoe', optional: true },
      { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/johndoe', optional: true },
      { key: 'portfolio', label: 'Portfolio URL', placeholder: 'johndoe.dev', optional: true },
    ],
  },
  {
    key: 'education',
    title: 'Education',
    isArray: true,
    fields: [
      { key: 'college', label: 'College / University', placeholder: 'IIT Bombay' },
      { key: 'degree', label: 'Degree', placeholder: 'B.Tech Computer Science',
        chips: ['B.Tech', 'B.E.', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA'] },
      { key: 'cgpa', label: 'CGPA / Percentage', placeholder: '8.5' },
      { key: 'year', label: 'Graduating Year', placeholder: '2025',
        chips: ['2024', '2025', '2026', '2027'] },
    ],
  },
  {
    key: 'experience',
    title: 'Work Experience',
    isArray: true,
    optional: true,
    fields: [
      { key: 'role', label: 'Role / Title', placeholder: 'Software Engineer Intern',
        chips: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Product Manager', 'UI/UX Designer'] },
      { key: 'company', label: 'Company', placeholder: 'Google' },
      { key: 'start', label: 'Start Date', placeholder: 'Jan 2024' },
      { key: 'end', label: 'End Date', placeholder: 'Present' },
      { key: 'bullets', label: 'What did you do? (one per line)', placeholder: 'Built a scalable API serving 10K requests/day\nReduced load time by 40% through caching', isMultiline: true },
    ],
  },
  {
    key: 'projects',
    title: 'Projects',
    isArray: true,
    fields: [
      { key: 'name', label: 'Project Name', placeholder: 'ResumeForge' },
      { key: 'techStack', label: 'Tech Stack', placeholder: 'React, Node.js, Puppeteer' },
      { key: 'github', label: 'GitHub / Live Link', placeholder: 'github.com/user/project', optional: true },
      { key: 'bullets', label: 'Description (one per line)', placeholder: 'AI-powered resume builder and analyser\nGenerates ATS-optimised PDFs in seconds', isMultiline: true },
    ],
  },
  {
    key: 'skills',
    title: 'Skills',
    fields: [
      { key: 'languages', label: 'Languages', placeholder: 'JavaScript, Python, Java, C++',
        chips: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'C#', 'SQL', 'HTML/CSS'] },
      { key: 'frameworks', label: 'Frameworks & Libraries', placeholder: 'React, Node.js, Express, Next.js',
        chips: ['React', 'Node.js', 'Express', 'Next.js', 'Django', 'Flask', 'Spring Boot', 'Angular', 'Vue.js', 'TailwindCSS'] },
      { key: 'tools', label: 'Tools & Platforms', placeholder: 'Git, Docker, AWS, MongoDB',
        chips: ['Git', 'Docker', 'AWS', 'GCP', 'MongoDB', 'PostgreSQL', 'Redis', 'Linux', 'Figma', 'Kubernetes'] },
    ],
  },
  {
    key: 'achievements',
    title: 'Achievements',
    optional: true,
    fields: [
      { key: 'items', label: 'Achievements (one per line)', placeholder: 'Won Smart India Hackathon 2024\nLeetCode 1800+ rating\nGoogle Cloud Certified', isMultiline: true },
    ],
  },
]

export default function Build() {
  const [step, setStep] = useState(STEPS.ENTRY)
  const [resumeData, setResumeData] = useState(JSON.parse(JSON.stringify(EMPTY_DATA)))
  const [qaSection, setQaSection] = useState(0)
  const [fontChoice, setFontChoice] = useState('Inter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle file upload (LinkedIn or any doc)
  async function handleUpload(file) {
    setLoading(true)
    setError(null)
    try {
      const structured = await api.parseStructured(file)
      setResumeData(mergeData(EMPTY_DATA, structured))
      setStep(STEPS.QA)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function startManual() {
    setResumeData(JSON.parse(JSON.stringify(EMPTY_DATA)))
    setQaSection(0)
    setStep(STEPS.QA)
  }

  function updateField(sectionKey, fieldKey, value, arrayIndex) {
    setResumeData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const section = QA_SECTIONS.find(s => s.key === sectionKey)

      if (sectionKey === 'achievements') {
        // Special handling for achievements array
        next.achievements = value.split('\n').filter(v => v.trim())
        return next
      }

      if (section?.isArray) {
        const idx = arrayIndex || 0
        if (!next[sectionKey][idx]) next[sectionKey][idx] = {}
        if (fieldKey === 'bullets') {
          next[sectionKey][idx].bullets = value.split('\n').filter(v => v.trim())
        } else {
          next[sectionKey][idx][fieldKey] = value
        }
      } else {
        if (!next[sectionKey]) next[sectionKey] = {}
        next[sectionKey][fieldKey] = value
      }
      return next
    })
  }

  function handleChipToggle(sectionKey, fieldKey, chips) {
    const value = Array.isArray(chips) ? chips.join(', ') : chips
    updateField(sectionKey, fieldKey, value)
  }

  function nextSection() {
    if (qaSection < QA_SECTIONS.length - 1) {
      setQaSection(qaSection + 1)
    } else {
      setStep(STEPS.FONT)
    }
  }

  function prevSection() {
    if (qaSection > 0) {
      setQaSection(qaSection - 1)
    } else {
      setStep(STEPS.ENTRY)
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const blob = await api.generatePdf(resumeData, fontChoice)
      api.downloadBlob(blob)
      setStep(STEPS.DONE)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function getFieldValue(sectionKey, fieldKey, arrayIndex) {
    if (sectionKey === 'achievements') {
      return (resumeData.achievements || []).join('\n')
    }
    const section = QA_SECTIONS.find(s => s.key === sectionKey)
    if (section?.isArray) {
      const item = resumeData[sectionKey]?.[arrayIndex || 0]
      if (fieldKey === 'bullets') return (item?.bullets || []).join('\n')
      return item?.[fieldKey] || ''
    }
    return resumeData[sectionKey]?.[fieldKey] || ''
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8">
        {step !== STEPS.ENTRY && (
          <button
            onClick={() => {
              if (step === STEPS.QA && qaSection === 0) setStep(STEPS.ENTRY)
              else if (step === STEPS.QA) prevSection()
              else if (step === STEPS.FONT) setStep(STEPS.QA)
              else if (step === STEPS.DONE) setStep(STEPS.FONT)
            }}
            className="text-sm text-text-tertiary hover:text-text-primary mb-4 flex items-center gap-1 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Build Resume</h1>
        <p className="text-sm text-text-secondary mt-1">
          {step === STEPS.ENTRY && 'Choose how you want to get started.'}
          {step === STEPS.QA && `Step ${qaSection + 1} of ${QA_SECTIONS.length} — ${QA_SECTIONS[qaSection].title}`}
          {step === STEPS.FONT && 'Choose a font for your resume.'}
          {step === STEPS.DONE && 'Your resume is ready!'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Step: Entry */}
      {step === STEPS.ENTRY && (
        <div className="space-y-4">
          <EntryCard
            title="Upload LinkedIn PDF"
            description="Export your LinkedIn profile as PDF and upload it. We'll auto-fill everything."
            icon="🔗"
          >
            <FileUpload onFileSelect={handleUpload} label="Upload LinkedIn PDF" description="Export from LinkedIn → Save as PDF" />
          </EntryCard>

          <EntryCard
            title="Upload Any Document"
            description="Upload a CV, marksheet, or any document. We'll extract whatever info is available."
            icon="📄"
          >
            <FileUpload onFileSelect={handleUpload} label="Upload Document" description="PDF, any format" />
          </EntryCard>

          <button
            type="button"
            onClick={startManual}
            className="w-full p-5 border border-border rounded-xl text-left hover:border-border-hover hover:bg-surface transition-all duration-150 group"
          >
            <span className="text-xl mb-2 block">✍️</span>
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">Start from Scratch</h3>
            <p className="text-xs text-text-secondary mt-1">Answer a few questions and we'll build your resume step by step.</p>
          </button>

          {loading && <div className="mt-4"><SkeletonText lines={3} /></div>}
        </div>
      )}

      {/* Step: Q&A */}
      {step === STEPS.QA && (
        <div className="space-y-5">
          {/* Progress bar */}
          <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${((qaSection + 1) / QA_SECTIONS.length) * 100}%` }}
            />
          </div>

          {(() => {
            const section = QA_SECTIONS[qaSection]
            return (
              <div className="space-y-5">
                {section.optional && (
                  <p className="text-xs text-text-tertiary">This section is optional. Skip if not applicable.</p>
                )}

                {section.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      {field.label}
                      {field.optional && <span className="text-text-tertiary font-normal ml-1">(optional)</span>}
                    </label>

                    {field.chips && (
                      <div className="mb-2">
                        <ChipSelect
                          options={field.chips}
                          selected={getFieldValue(section.key, field.key)?.split(', ').filter(Boolean) || []}
                          onToggle={(chips) => handleChipToggle(section.key, field.key, chips)}
                          multiple={section.key === 'skills'}
                        />
                      </div>
                    )}

                    {field.isMultiline ? (
                      <textarea
                        value={getFieldValue(section.key, field.key)}
                        onChange={e => updateField(section.key, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full p-3 border border-border rounded-lg text-sm resize-none focus:border-accent transition-colors"
                      />
                    ) : (
                      <input
                        type="text"
                        value={getFieldValue(section.key, field.key)}
                        onChange={e => updateField(section.key, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full p-3 border border-border rounded-lg text-sm focus:border-accent transition-colors"
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevSection}
                    className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-surface rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    {qaSection === 0 ? 'Back' : 'Previous'}
                  </button>
                  <button
                    type="button"
                    onClick={nextSection}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    {qaSection === QA_SECTIONS.length - 1 ? 'Choose Font' : 'Next'}
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Step: Font */}
      {step === STEPS.FONT && (
        <div className="space-y-6">
          <FontSelector selected={fontChoice} onSelect={setFontChoice} />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate & Download Resume'}
          </button>
          {loading && <SkeletonText lines={2} />}
        </div>
      )}

      {/* Step: Done */}
      {step === STEPS.DONE && (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary">Resume Downloaded!</h2>
          <p className="text-sm text-text-secondary">Your resume has been generated and downloaded as a PDF.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Download Again
            </button>
            <button
              type="button"
              onClick={() => { setStep(STEPS.FONT) }}
              className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-surface rounded-lg hover:bg-surface-hover border border-border transition-colors"
            >
              Change Font
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EntryCard({ title, description, icon, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-5 text-left hover:bg-surface transition-colors flex items-start gap-3"
      >
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

function mergeData(base, incoming) {
  const merged = JSON.parse(JSON.stringify(base))
  if (!incoming) return merged

  for (const key of Object.keys(merged)) {
    if (incoming[key] !== undefined && incoming[key] !== null) {
      if (Array.isArray(merged[key])) {
        merged[key] = incoming[key].length > 0 ? incoming[key] : merged[key]
      } else if (typeof merged[key] === 'object') {
        for (const subKey of Object.keys(merged[key])) {
          if (incoming[key][subKey]) merged[key][subKey] = incoming[key][subKey]
        }
      } else {
        merged[key] = incoming[key]
      }
    }
  }
  return merged
}
