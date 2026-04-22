import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function Layout({ children }) {
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/analyse', label: 'Analyse' },
    { to: '/build', label: 'Build' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-blue-600 selection:text-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline group outline-none">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
              <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">ResumeForge</span>
          </Link>

          <div className="flex items-center gap-2">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors outline-none
                    ${isActive ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-blue-50 rounded-md -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-gray-500">
            ResumeForge — Build better resumes, land better jobs.
          </p>
        </div>
      </footer>
    </div>
  )
}
