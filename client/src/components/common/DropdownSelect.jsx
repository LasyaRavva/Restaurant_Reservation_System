import { useEffect, useMemo, useRef, useState } from 'react'

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DropdownSelect({
  value,
  options,
  placeholder = 'Select',
  onChange,
  className = '',
  getLabel = option => option.label,
  getValue = option => option.value,
  disabled = false
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const selectedLabel = useMemo(() => {
    const selected = options.find(option => String(getValue(option)) === String(value))
    return selected ? getLabel(selected) : placeholder
  }, [getLabel, getValue, options, placeholder, value])

  useEffect(() => {
    function handleOutsideClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [])

  return (
    <div ref={wrapperRef} className={`dropdown-select ${className} ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="dropdown-select-trigger"
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>{selectedLabel}</span>
        <Chevron />
      </button>

      {open && (
        <div className="dropdown-select-menu" role="listbox">
          {options.map(option => {
            const optionValue = getValue(option)
            const active = String(optionValue) === String(value)
            return (
              <button
                key={String(optionValue)}
                type="button"
                className={`dropdown-select-option ${active ? 'active' : ''}`}
                onClick={() => {
                  onChange(optionValue)
                  setOpen(false)
                }}
              >
                {getLabel(option)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
