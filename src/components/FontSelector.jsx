const fonts = [
  { name: 'Inter', family: "'Inter', sans-serif", style: 'Clean & Modern' },
  { name: 'Georgia', family: "'Georgia', serif", style: 'Classic & Formal' },
  { name: 'Roboto Mono', family: "'Roboto Mono', monospace", style: 'Technical & Precise' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", style: 'Elegant & Bold' },
]

export default function FontSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {fonts.map(font => (
        <button
          key={font.name}
          type="button"
          onClick={() => onSelect(font.name)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left
            ${selected === font.name
              ? 'border-accent bg-accent-light'
              : 'border-border hover:border-border-hover'
            }`}
        >
          <div className="mb-3" style={{ fontFamily: font.family }}>
            <p className="text-lg font-bold leading-tight">John Doe</p>
            <p className="text-xs mt-1 leading-snug">Software Engineer with 3 years of experience building scalable apps.</p>
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <p className="text-xs font-semibold text-text-primary">{font.name}</p>
            <p className="text-[10px] text-text-tertiary">{font.style}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
