export default function ChipSelect({ options = [], selected = [], onToggle, multiple = true }) {
  function handleClick(value) {
    if (multiple) {
      if (selected.includes(value)) {
        onToggle(selected.filter(v => v !== value))
      } else {
        onToggle([...selected, value])
      }
    } else {
      onToggle(value === selected ? '' : value)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isSelected = multiple ? selected.includes(option) : selected === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleClick(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150
              ${isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
