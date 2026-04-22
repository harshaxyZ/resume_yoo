import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2 } from 'lucide-react'

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
      className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200
        ${isDragging
          ? 'border-blue-600 bg-blue-50 shadow-inner'
          : fileName
            ? 'border-blue-300 bg-blue-50/50 hover:border-blue-400'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        {fileName ? (
          <>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Click to change file</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <UploadCloud className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{description}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
