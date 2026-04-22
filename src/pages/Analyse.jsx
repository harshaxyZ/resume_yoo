import { useState } from 'react'
import { ArrowLeft, BarChart3, Search, Crosshair, PenLine } from 'lucide-react'
import { motion } from 'framer-motion'
import FileUpload from '../components/FileUpload'
import ScoreMeter from '../components/ScoreMeter'
import { AnalysisSkeleton, SkeletonText } from '../components/SkeletonLoader'
import * as api from '../api'

const VIEWS = {
  UPLOAD: 'upload',
  ACTIONS: 'actions',
  ATS: 'ats',
  WEAKNESS: 'weakness',
  TAILOR: 'tailor',
  EDIT: 'edit',
}

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

export default function Analyse() {
  const [view, setView] = useState(VIEWS.UPLOAD)
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Results
  const [atsResult, setAtsResult] = useState(null)
  const [weaknessResult, setWeaknessResult] = useState(null)
  const [tailorResult, setTailorResult] = useState(null)
  const [editResult, setEditResult] = useState(null)

  // Tailor inputs
  const [jdText, setJdText] = useState('')
  const [jdUrl, setJdUrl] = useState('')
  const [jdMode, setJdMode] = useState('text')

  // Edit input
  const [editInstruction, setEditInstruction] = useState('')

  async function handleFileUpload(file) {
    setLoading(true)
    setError(null)
    try {
      const { text } = await api.parseResume(file)
      setResumeText(text)
      setView(VIEWS.ACTIONS)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAts() {
    setView(VIEWS.ATS)
    setLoading(true)
    setError(null)
    try {
      const result = await api.analyseAts(resumeText)
      setAtsResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleWeakness() {
    setView(VIEWS.WEAKNESS)
    setLoading(true)
    setError(null)
    try {
      const result = await api.analyseWeakness(resumeText)
      setWeaknessResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTailor() {
    setLoading(true)
    setError(null)
    try {
      let finalJd = jdText
      if (jdMode === 'url' && jdUrl) {
        const { jdText: scraped } = await api.scrapeJd(jdUrl)
        finalJd = scraped
        setJdText(scraped)
      }
      if (!finalJd.trim()) {
        setError('Please provide a job description.')
        setLoading(false)
        return
      }
      const result = await api.tailorResume(resumeText, finalJd)
      setTailorResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit() {
    if (!editInstruction.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.editResume(resumeText, editInstruction)
      setEditResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadPdf(data) {
    try {
      const blob = await api.generatePdf(data, 'Inter')
      api.downloadBlob(blob)
    } catch (err) {
      setError('Failed to download PDF. Please try again.')
    }
  }

  function goBack() {
    setError(null)
    if (view === VIEWS.ACTIONS) {
      setView(VIEWS.UPLOAD)
      setResumeText('')
    } else {
      setView(VIEWS.ACTIONS)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        {view !== VIEWS.UPLOAD && (
          <button 
            onClick={goBack} 
            className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Analyse Resume</h1>
        <p className="text-base text-gray-500 mt-2">Upload your resume PDF to unlock AI-powered insights and enhancements.</p>
      </div>

      {/* Error */}
      {error && (
        <motion.div {...pageTransition} className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-800">
          {error}
        </motion.div>
      )}

      {/* Upload View */}
      {view === VIEWS.UPLOAD && (
        <motion.div {...pageTransition}>
          <FileUpload onFileSelect={handleFileUpload} />
          {loading && <div className="mt-8"><SkeletonText lines={2} /></div>}
        </motion.div>
      )}

      {/* Action Cards */}
      {view === VIEWS.ACTIONS && (
        <motion.div {...pageTransition} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            title="ATS Score"
            description="See how well your resume scores against ATS systems"
            icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
            onClick={handleAts}
          />
          <ActionCard
            title="Weakness Check"
            description="Find weak points and get specific suggestions to fix them"
            icon={<Search className="w-6 h-6 text-blue-600" />}
            onClick={handleWeakness}
          />
          <ActionCard
            title="Tailor to Job"
            description="Rewrite your resume to match a specific job description"
            icon={<Crosshair className="w-6 h-6 text-blue-600" />}
            onClick={() => { setView(VIEWS.TAILOR); setTailorResult(null) }}
          />
          <ActionCard
            title="Edit Resume"
            description="Give plain English instructions to modify your resume"
            icon={<PenLine className="w-6 h-6 text-blue-600" />}
            onClick={() => { setView(VIEWS.EDIT); setEditResult(null) }}
          />
        </motion.div>
      )}

      {/* ATS View */}
      {view === VIEWS.ATS && (
        loading ? <AnalysisSkeleton /> : atsResult && (
          <motion.div {...pageTransition} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-8 p-8 border border-gray-200 rounded-2xl bg-white shadow-sm">
              <ScoreMeter score={atsResult.score} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">Your ATS Score</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{atsResult.summary}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(atsResult.breakdown || {}).map(([key, val]) => (
                <div key={key} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-extrabold text-blue-600">{val.score}/25</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(val.score / 25) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-blue-600 rounded-full" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">{val.feedback}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )
      )}

      {/* Weakness View */}
      {view === VIEWS.WEAKNESS && (
        loading ? <AnalysisSkeleton /> : weaknessResult && (
          <motion.div {...pageTransition} className="space-y-4">
            {weaknessResult.overallAdvice && (
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 leading-relaxed">
                {weaknessResult.overallAdvice}
              </div>
            )}
            {(weaknessResult.missingSections || []).length > 0 && (
              <div className="p-5 border border-amber-200 bg-amber-50 rounded-2xl">
                <p className="text-sm font-bold text-amber-900 mb-3">Missing Sections</p>
                <div className="flex flex-wrap gap-2">
                  {weaknessResult.missingSections.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-bold uppercase tracking-wide">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {(weaknessResult.weaknesses || []).map((w, i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md">{w.section}</span>
                </div>
                <p className="text-sm text-gray-900 font-bold mb-2">{w.issue}</p>
                {w.original && w.original !== 'Missing section' && (
                  <p className="text-xs text-gray-500 line-through bg-gray-50 p-2 rounded-md border border-gray-100 mb-3">{w.original}</p>
                )}
                <div className="flex gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <p className="text-sm text-blue-800 font-medium">{w.suggestion}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )
      )}

      {/* Tailor View */}
      {view === VIEWS.TAILOR && (
        <motion.div {...pageTransition} className="space-y-6">
          {!tailorResult && (
            <>
              <div className="flex p-1 bg-gray-100 rounded-xl mb-4 w-fit">
                <button
                  type="button"
                  onClick={() => setJdMode('text')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all
                    ${jdMode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Paste JD
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode('url')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all
                    ${jdMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  From URL
                </button>
              </div>

              {jdMode === 'text' ? (
                <textarea
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  placeholder="Paste the exact job description here to tailor your resume..."
                  rows={8}
                  className="w-full p-5 border border-gray-200 rounded-2xl text-sm resize-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-shadow outline-none shadow-sm"
                />
              ) : (
                <input
                  type="text"
                  value={jdUrl}
                  onChange={e => setJdUrl(e.target.value)}
                  placeholder="Paste job URL (e.g. from LinkedIn, Workday, etc.)"
                  className="w-full p-5 border border-gray-200 rounded-2xl text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-shadow outline-none shadow-sm"
                />
              )}

              <button
                type="button"
                onClick={handleTailor}
                disabled={loading}
                className="w-full px-8 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? 'AI is Tailoring...' : 'Tailor My Resume'}
              </button>

              {loading && <div className="mt-8"><AnalysisSkeleton /></div>}
            </>
          )}

          {tailorResult && (
            <div className="space-y-6 mt-4">
              <div className="p-5 bg-green-50 border border-green-200 rounded-2xl text-sm font-medium text-green-800">
                Your resume has been successfully tailored to the job description!
              </div>
              <ResumePreview data={tailorResult} />
              <button
                type="button"
                onClick={() => handleDownloadPdf(tailorResult)}
                className="w-full px-8 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
              >
                Download PDF
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Edit View */}
      {view === VIEWS.EDIT && (
        <motion.div {...pageTransition} className="space-y-6">
          <textarea
            value={editInstruction}
            onChange={e => setEditInstruction(e.target.value)}
            placeholder='Type your instruction, e.g. "Make my project descriptions more quantifiable" or "Add a skill for Next.js"'
            rows={4}
            className="w-full p-5 border border-gray-200 rounded-2xl text-sm resize-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-shadow outline-none shadow-sm"
          />

          <button
            type="button"
            onClick={handleEdit}
            disabled={loading || !editInstruction.trim()}
            className="w-full px-8 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? 'AI is Editing...' : 'Apply Changes'}
          </button>

          {loading && <div className="mt-8"><AnalysisSkeleton /></div>}

          {editResult && (
            <div className="space-y-6 mt-8">
              <div className="p-5 bg-green-50 border border-green-200 rounded-2xl text-sm font-medium text-green-800">
                Changes applied successfully.
              </div>
              <ResumePreview data={editResult} />
              <button
                type="button"
                onClick={() => handleDownloadPdf(editResult)}
                className="w-full px-8 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
              >
                Download PDF
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function ActionCard({ title, description, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-6 border border-gray-200 rounded-2xl text-left bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 active:scale-[0.98] transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
    </button>
  )
}

function ResumePreview({ data }) {
  const p = data.personal || {}
  return (
    <div className="border border-gray-200 rounded-2xl p-8 text-sm space-y-6 bg-white shadow-sm">
      <div className="text-center pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-extrabold text-gray-900">{p.name}</h2>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          {[p.phone, p.email, p.github, p.linkedin, p.portfolio].filter(Boolean).join('  •  ')}
        </p>
      </div>

      {data.education?.length > 0 && (
        <PreviewSection title="Education">
          {data.education.map((e, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="font-bold text-gray-900">{e.college}</p>
              <p className="text-gray-600 mt-0.5">{e.degree}{e.cgpa ? `, CGPA: ${e.cgpa}` : ''}{e.year ? ` — ${e.year}` : ''}</p>
            </div>
          ))}
        </PreviewSection>
      )}

      {data.experience?.length > 0 && (
        <PreviewSection title="Experience">
          {data.experience.map((e, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="flex justify-between items-baseline mb-1.5">
                <p className="font-bold text-gray-900">{e.role}{e.company ? ` @ ${e.company}` : ''}</p>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{e.start}{e.end ? ` – ${e.end}` : ''}</span>
              </div>
              <ul className="list-disc list-outside ml-4 text-gray-600 space-y-1 mt-2">
                {(e.bullets || []).map((b, j) => <li key={j} className="leading-relaxed">{b}</li>)}
              </ul>
            </div>
          ))}
        </PreviewSection>
      )}

      {data.projects?.length > 0 && (
        <PreviewSection title="Projects">
          {data.projects.map((p, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <p className="font-bold text-gray-900">{p.name}{p.techStack ? ` | ${p.techStack}` : ''}</p>
              <ul className="list-disc list-outside ml-4 text-gray-600 space-y-1 mt-2">
                {(p.bullets || []).map((b, j) => <li key={j} className="leading-relaxed">{b}</li>)}
              </ul>
            </div>
          ))}
        </PreviewSection>
      )}

      {data.skills && (
        <PreviewSection title="Skills">
          <div className="space-y-2">
            {data.skills.languages && <p><strong className="text-gray-900">Languages:</strong> <span className="text-gray-600">{data.skills.languages}</span></p>}
            {data.skills.frameworks && <p><strong className="text-gray-900">Frameworks:</strong> <span className="text-gray-600">{data.skills.frameworks}</span></p>}
            {data.skills.tools && <p><strong className="text-gray-900">Tools:</strong> <span className="text-gray-600">{data.skills.tools}</span></p>}
          </div>
        </PreviewSection>
      )}

      {data.achievements?.length > 0 && (
        <PreviewSection title="Achievements">
          <ul className="list-disc list-outside ml-4 text-gray-600 space-y-1">
            {data.achievements.filter(Boolean).map((a, i) => <li key={i} className="leading-relaxed">{a}</li>)}
          </ul>
        </PreviewSection>
      )}
    </div>
  )
}

function PreviewSection({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  )
}
