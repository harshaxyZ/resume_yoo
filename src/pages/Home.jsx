import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Wand2, Search, ArrowRight } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 sm:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-100"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
          ResumeForge 2.0 is live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]"
        >
          Build. Analyse.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Get Hired.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed"
        >
          Your AI-powered resume companion. Get ATS scores, fix weaknesses,
          tailor to job descriptions, and build professional resumes in minutes.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            to="/analyse"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-xl
              hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            Analyse My Resume
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/build"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 text-base font-semibold rounded-xl
              border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            Build a Resume
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="pb-24 sm:pb-32">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="ATS Score Check"
            description="Get a detailed breakdown of how well your resume performs against modern applicant tracking systems."
          />
          <FeatureCard
            icon={<Wand2 className="w-6 h-6 text-blue-600" />}
            title="Smart Resume Builder"
            description="Build from scratch, upload a LinkedIn export, or paste any document. AI fills in the rest."
          />
          <FeatureCard
            icon={<Search className="w-6 h-6 text-gray-400" />}
            title="Job Matching"
            description="Find jobs that match your resume and skills seamlessly. Powered by AI analysis."
            comingSoon
          />
        </motion.div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description, comingSoon = false }) {
  return (
    <motion.div 
      variants={item}
      className={`relative border rounded-2xl p-8 transition-all duration-200 ${
        comingSoon 
          ? 'border-gray-200 bg-gray-50/50' 
          : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5'
      }`}
    >
      {comingSoon && (
        <span className="absolute top-6 right-6 px-2.5 py-1 bg-white text-gray-500 text-[11px] font-bold uppercase tracking-wider rounded-full border border-gray-200 shadow-sm">
          Coming Soon
        </span>
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${comingSoon ? 'bg-gray-100' : 'bg-blue-50'}`}>
        {icon}
      </div>
      <h3 className={`text-lg font-bold mb-2 tracking-tight ${comingSoon ? 'text-gray-500' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed ${comingSoon ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
    </motion.div>
  )
}
