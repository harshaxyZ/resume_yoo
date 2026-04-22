import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-tight">
          Build. Analyse.
          <br />
          <span className="text-accent">Get Hired.</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
          Your AI-powered resume companion. Get ATS scores, fix weaknesses,
          tailor to job descriptions, and build professional resumes in minutes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/analyse"
            className="w-full sm:w-auto px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg
              hover:bg-accent-hover transition-colors duration-150 no-underline text-center"
          >
            Analyse My Resume
          </Link>
          <Link
            to="/build"
            className="w-full sm:w-auto px-6 py-3 bg-white text-text-primary text-sm font-semibold rounded-lg
              border border-border hover:border-border-hover hover:bg-surface transition-colors duration-150 no-underline text-center"
          >
            Build a Resume
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20 sm:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            title="ATS Score Check"
            description="Get a detailed breakdown of how well your resume performs against applicant tracking systems."
          />
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
            title="Smart Resume Builder"
            description="Build from scratch, upload a LinkedIn export, or paste any document. AI fills in the rest."
          />
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            title="Job Matching"
            description="Find jobs that match your resume and skills. Powered by AI analysis."
            comingSoon
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description, comingSoon = false }) {
  return (
    <div className="relative border border-border rounded-xl p-6 hover:border-border-hover transition-colors duration-150">
      {comingSoon && (
        <span className="absolute top-4 right-4 px-2 py-0.5 bg-surface text-text-tertiary text-[10px] font-semibold uppercase tracking-wider rounded-full border border-border">
          Coming Soon
        </span>
      )}
      <div className="w-9 h-9 rounded-lg bg-accent-light text-accent flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}
