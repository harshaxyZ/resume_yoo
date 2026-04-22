import { useState, useRef } from 'react'

export default function FileUpload({ onFileSelect, accept = '.pdf', label = 'Upload PDF', description = 'Drag and drop or click to select' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const inputRef = useRef(null)

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e) {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200
        ${isDragging
          ? 'border-accent bg-accent-light'
          : fileName
            ? 'border-accent/40 bg-accent-light/50'
            : 'border-border hover:border-border-hover hover:bg-surface'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        {fileName ? (
          <>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{fileName}</p>
              <p className="text-xs text-text-tertiary mt-1">Click to change file</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-tertiary mt-1">{description}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
