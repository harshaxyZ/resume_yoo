import { useState } from 'react'
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8">
        {view !== VIEWS.UPLOAD && (
          <button onClick={goBack} className="text-sm text-text-tertiary hover:text-text-primary mb-4 flex items-center gap-1 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Analyse Resume</h1>
        <p className="text-sm text-text-secondary mt-1">Upload your resume PDF to get started.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Upload View */}
      {view === VIEWS.UPLOAD && (
        <div>
          <FileUpload onFileSelect={handleFileUpload} />
          {loading && <div className="mt-6"><SkeletonText lines={2} /></div>}
        </div>
      )}

      {/* Action Cards */}
      {view === VIEWS.ACTIONS && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            title="ATS Score"
            description="See how well your resume scores against ATS systems"
            icon="📊"
            onClick={handleAts}
          />
          <ActionCard
            title="Weakness Check"
            description="Find weak points and get specific suggestions to fix them"
            icon="🔍"
            onClick={handleWeakness}
          />
          <ActionCard
            title="Tailor to Job"
            description="Rewrite your resume to match a specific job description"
            icon="🎯"
            onClick={() => { setView(VIEWS.TAILOR); setTailorResult(null) }}
          />
          <ActionCard
            title="Edit Resume"
            description="Give plain English instructions to modify your resume"
            icon="✏️"
            onClick={() => { setView(VIEWS.EDIT); setEditResult(null) }}
          />
        </div>
      )}

      {/* ATS View */}
      {view === VIEWS.ATS && (
        loading ? <AnalysisSkeleton /> : atsResult && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border border-border rounded-xl">
              <ScoreMeter score={atsResult.score} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold text-text-primary">Your ATS Score</h2>
                <p className="text-sm text-text-secondary mt-1">{atsResult.summary}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(atsResult.breakdown || {}).map(([key, val]) => (
                <div key={key} className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-bold text-accent">{val.score}/25</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${(val.score / 25) * 100}%` }} />
                  </div>
                  <p className="text-xs text-text-secondary mt-2">{val.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Weakness View */}
      {view === VIEWS.WEAKNESS && (
        loading ? <AnalysisSkeleton /> : weaknessResult && (
          <div className="space-y-4">
            {weaknessResult.overallAdvice && (
              <div className="p-4 bg-surface rounded-xl text-sm text-text-secondary">{weaknessResult.overallAdvice}</div>
            )}
            {(weaknessResult.missingSections || []).length > 0 && (
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
                <p className="text-sm font-medium text-amber-800 mb-2">Missing Sections</p>
                <div className="flex flex-wrap gap-2">
                  {weaknessResult.missingSections.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {(weaknessResult.weaknesses || []).map((w, i) => (
              <div key={i} className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-surface text-text-tertiary text-[10px] font-semibold uppercase rounded">{w.section}</span>
                </div>
                <p className="text-sm text-text-primary font-medium">{w.issue}</p>
                {w.original && w.original !== 'Missing section' && (
                  <p className="text-xs text-text-tertiary mt-1.5 line-through">{w.original}</p>
                )}
                <p className="text-sm text-accent mt-1.5">→ {w.suggestion}</p>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tailor View */}
      {view === VIEWS.TAILOR && (
        <div className="space-y-4">
          {!tailorResult && (
            <>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setJdMode('text')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                    ${jdMode === 'text' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:bg-surface-hover'}`}
                >
                  Paste JD
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode('url')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                    ${jdMode === 'url' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:bg-surface-hover'}`}
                >
                  From URL
                </button>
              </div>

              {jdMode === 'text' ? (
                <textarea
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={8}
                  className="w-full p-4 border border-border rounded-xl text-sm resize-none focus:border-accent focus:ring-0 transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={jdUrl}
                  onChange={e => setJdUrl(e.target.value)}
                  placeholder="Paste job URL (Naukri, LinkedIn, etc.)"
                  className="w-full p-4 border border-border rounded-xl text-sm focus:border-accent focus:ring-0 transition-colors"
                />
              )}

              <button
                type="button"
                onClick={handleTailor}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {loading ? 'Tailoring...' : 'Tailor My Resume'}
              </button>

              {loading && <div className="mt-4"><AnalysisSkeleton /></div>}
            </>
          )}

          {tailorResult && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                Your resume has been tailored to the job description. Download the updated version below.
              </div>
              <ResumePreview data={tailorResult} />
              <button
                type="button"
                onClick={() => handleDownloadPdf(tailorResult)}
                className="w-full sm:w-auto px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit View */}
      {view === VIEWS.EDIT && (
        <div className="space-y-4">
          <textarea
            value={editInstruction}
            onChange={e => setEditInstruction(e.target.value)}
            placeholder='Type your instruction, e.g. "Make my project descriptions stronger" or "Change my email to x@y.com"'
            rows={4}
            className="w-full p-4 border border-border rounded-xl text-sm resize-none focus:border-accent focus:ring-0 transition-colors"
          />

          <button
            type="button"
            onClick={handleEdit}
            disabled={loading || !editInstruction.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Editing...' : 'Apply Changes'}
          </button>

          {loading && <div className="mt-4"><AnalysisSkeleton /></div>}

          {editResult && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                Changes applied successfully. Download the updated resume below.
              </div>
              <ResumePreview data={editResult} />
              <button
                type="button"
                onClick={() => handleDownloadPdf(editResult)}
                className="w-full sm:w-auto px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionCard({ title, description, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-5 border border-border rounded-xl text-left hover:border-border-hover hover:bg-surface transition-all duration-150 group"
    >
      <span className="text-xl mb-2 block">{icon}</span>
      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{title}</h3>
      <p className="text-xs text-text-secondary mt-1">{description}</p>
    </button>
  )
}

function ResumePreview({ data }) {
  const p = data.personal || {}
  return (
    <div className="border border-border rounded-xl p-6 text-sm space-y-4 bg-white">
      <div className="text-center">
        <h2 className="text-lg font-bold">{p.name}</h2>
        <p className="text-xs text-text-secondary mt-1">
          {[p.phone, p.email, p.github, p.linkedin, p.portfolio].filter(Boolean).join(' | ')}
        </p>
      </div>

      {data.education?.length > 0 && (
        <PreviewSection title="Education">
          {data.education.map((e, i) => (
            <div key={i}>
              <p className="font-medium">{e.college}</p>
              <p className="text-text-secondary">{e.degree}{e.cgpa ? `, CGPA: ${e.cgpa}` : ''}{e.year ? ` — ${e.year}` : ''}</p>
            </div>
          ))}
        </PreviewSection>
      )}

      {data.experience?.length > 0 && (
        <PreviewSection title="Experience">
          {data.experience.map((e, i) => (
            <div key={i}>
              <p className="font-medium">{e.role}{e.company ? ` @ ${e.company}` : ''} <span className="text-text-tertiary font-normal">{e.start}{e.end ? ` – ${e.end}` : ''}</span></p>
              <ul className="list-disc list-inside text-text-secondary mt-1">
                {(e.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </PreviewSection>
      )}

      {data.projects?.length > 0 && (
        <PreviewSection title="Projects">
          {data.projects.map((p, i) => (
            <div key={i}>
              <p className="font-medium">{p.name}{p.techStack ? ` | ${p.techStack}` : ''}</p>
              <ul className="list-disc list-inside text-text-secondary mt-1">
                {(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </PreviewSection>
      )}

      {data.skills && (
        <PreviewSection title="Skills">
          {data.skills.languages && <p><strong>Languages:</strong> {data.skills.languages}</p>}
          {data.skills.frameworks && <p><strong>Frameworks:</strong> {data.skills.frameworks}</p>}
          {data.skills.tools && <p><strong>Tools:</strong> {data.skills.tools}</p>}
        </PreviewSection>
      )}

      {data.achievements?.length > 0 && (
        <PreviewSection title="Achievements">
          <ul className="list-disc list-inside text-text-secondary">
            {data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </PreviewSection>
      )}
    </div>
  )
}

function PreviewSection({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-1 mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
