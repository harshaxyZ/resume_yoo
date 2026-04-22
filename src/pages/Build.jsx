import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, FileText, PenLine, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
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

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

export default function Build() {
  const [step, setStep] = useState(STEPS.ENTRY)
  const [resumeData, setResumeData] = useState(JSON.parse(JSON.stringify(EMPTY_DATA)))
  const [qaSection, setQaSection] = useState(0)
  const [fontChoice, setFontChoice] = useState('Inter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <div className="mb-10">
        {step !== STEPS.ENTRY && (
          <button
            onClick={() => {
              if (step === STEPS.QA && qaSection === 0) setStep(STEPS.ENTRY)
              else if (step === STEPS.QA) prevSection()
              else if (step === STEPS.FONT) setStep(STEPS.QA)
              else if (step === STEPS.DONE) setStep(STEPS.FONT)
            }}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Build Resume</h1>
        <p className="text-base text-gray-500 mt-2">
          {step === STEPS.ENTRY && 'Choose how you want to get started.'}
          {step === STEPS.QA && `Step ${qaSection + 1} of ${QA_SECTIONS.length} — ${QA_SECTIONS[qaSection].title}`}
          {step === STEPS.FONT && 'Choose a font for your resume.'}
          {step === STEPS.DONE && 'Your resume is ready!'}
        </p>
      </div>

      {error && (
        <motion.div {...pageTransition} className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-800">
          {error}
        </motion.div>
      )}

      {step === STEPS.ENTRY && (
        <motion.div {...pageTransition} className="space-y-4">
          <EntryCard
            title="Upload LinkedIn PDF"
            description="Export your LinkedIn profile as PDF and upload it. We'll auto-fill everything."
            icon={<Link2 className="w-6 h-6 text-blue-600" />}
          >
            <FileUpload onFileSelect={handleUpload} label="Upload LinkedIn PDF" description="Export from LinkedIn → Save as PDF" />
          </EntryCard>

          <EntryCard
            title="Upload Any Document"
            description="Upload a CV, marksheet, or any document. We'll extract whatever info is available."
            icon={<FileText className="w-6 h-6 text-blue-600" />}
          >
            <FileUpload onFileSelect={handleUpload} label="Upload Document" description="PDF, any format" />
          </EntryCard>

          <button
            type="button"
            onClick={startManual}
            className="w-full p-6 border border-gray-200 rounded-2xl text-left hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 bg-white transition-all duration-200 group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
              <PenLine className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Start from Scratch</h3>
              <p className="text-sm text-gray-500 mt-1">Answer a few questions and we'll build your resume step by step.</p>
            </div>
          </button>

          {loading && <div className="mt-8"><SkeletonText lines={3} /></div>}
        </motion.div>
      )}

      {step === STEPS.QA && (
        <motion.div {...pageTransition} className="space-y-8">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((qaSection + 1) / QA_SECTIONS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>

          <div className="space-y-6">
            {QA_SECTIONS[qaSection].optional && (
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">This section is optional. Skip if not applicable.</p>
            )}

            {QA_SECTIONS[qaSection].fields.map(field => (
              <div key={field.key} className="space-y-2">
                <label className="block text-sm font-bold text-gray-900">
                  {field.label}
                  {field.optional && <span className="text-gray-400 font-medium ml-2">(optional)</span>}
                </label>

                {field.chips && (
                  <div className="mb-3">
                    <ChipSelect
                      options={field.chips}
                      selected={getFieldValue(QA_SECTIONS[qaSection].key, field.key)?.split(', ').filter(Boolean) || []}
                      onToggle={(chips) => handleChipToggle(QA_SECTIONS[qaSection].key, field.key, chips)}
                      multiple={QA_SECTIONS[qaSection].key === 'skills'}
                    />
                  </div>
                )}

                {field.isMultiline ? (
                  <textarea
                    value={getFieldValue(QA_SECTIONS[qaSection].key, field.key)}
                    onChange={e => updateField(QA_SECTIONS[qaSection].key, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm resize-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-shadow outline-none shadow-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={getFieldValue(QA_SECTIONS[qaSection].key, field.key)}
                    onChange={e => updateField(QA_SECTIONS[qaSection].key, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-shadow outline-none shadow-sm"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-between pt-6 border-t border-gray-100 mt-8">
              <button
                type="button"
                onClick={prevSection}
                className="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> {qaSection === 0 ? 'Back' : 'Previous'}
              </button>
              <button
                type="button"
                onClick={nextSection}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {qaSection === QA_SECTIONS.length - 1 ? 'Choose Font' : 'Next'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === STEPS.FONT && (
        <motion.div {...pageTransition} className="space-y-8">
          <FontSelector selected={fontChoice} onSelect={setFontChoice} />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-8 py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Generating PDF...' : 'Generate & Download Resume'}
          </button>
          {loading && <SkeletonText lines={2} />}
        </motion.div>
      )}

      {step === STEPS.DONE && (
        <motion.div {...pageTransition} className="text-center py-16 space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Resume Downloaded!</h2>
            <p className="text-base text-gray-500 mt-2">Your resume has been successfully generated and saved to your device.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
            >
              Download Again
            </button>
            <button
              type="button"
              onClick={() => { setStep(STEPS.FONT) }}
              className="px-8 py-3.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all shadow-sm"
            >
              Change Font
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function EntryCard({ title, description, icon, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all ${open ? 'shadow-md border-blue-200' : 'hover:border-blue-200 hover:shadow-sm'}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center gap-4 group"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
