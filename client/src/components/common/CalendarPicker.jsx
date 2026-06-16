import { useEffect, useMemo, useRef, useState } from 'react'

function formatInputValue(date) {
  return date.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}

function formatMonthLabel(date) {
  return date.toLocaleDateString([], {
    month: 'long',
    year: 'numeric'
  })
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isSameDate(left, right) {
  return left && right && toDateKey(left) === toDateKey(right)
}

function getCalendarDays(currentMonth) {
  const firstDay = startOfMonth(currentMonth)
  const lastDay = endOfMonth(currentMonth)
  const startOffset = (firstDay.getDay() + 6) % 7
  const days = []

  for (let i = startOffset; i > 0; i -= 1) {
    const date = new Date(firstDay)
    date.setDate(firstDay.getDate() - i)
    days.push({ date, outside: true })
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), outside: false })
  }

  const remainder = days.length % 7
  if (remainder !== 0) {
    const needed = 7 - remainder
    for (let i = 1; i <= needed; i += 1) {
      const date = new Date(lastDay)
      date.setDate(lastDay.getDate() + i)
      days.push({ date, outside: true })
    }
  }

  return days
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2v3M17 2v3M3.5 8.5h17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function Chevron({ direction = 'down' }) {
  const transform = direction === 'down' ? 'rotate(0 12 12)' : 'rotate(180 12 12)'
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform }}>
      <path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CalendarPicker({ value, onChange, minDate }) {
  const wrapperRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [monthView, setMonthView] = useState(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number)
      return new Date(year, month - 1, 1)
    }
    return new Date()
  })

  const selectedDate = useMemo(() => {
    if (!value) return null
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }, [value])

  const minDateObj = useMemo(() => {
    if (!minDate) return null
    const [year, month, day] = minDate.split('-').map(Number)
    return new Date(year, month - 1, day)
  }, [minDate])

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

  useEffect(() => {
    if (!value) return
    const [year, month] = value.split('-').map(Number)
    setMonthView(new Date(year, month - 1, 1))
  }, [value])

  const days = useMemo(() => getCalendarDays(monthView), [monthView])

  function isDisabled(date) {
    return minDateObj ? date < minDateObj && !isSameDate(date, minDateObj) : false
  }

  function selectDate(date) {
    if (isDisabled(date)) return
    onChange(toDateKey(date))
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="calendar-picker">
      <button
        type="button"
        className={`calendar-field ${open ? 'open' : ''} ${selectedDate ? 'selected' : ''}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>{selectedDate ? formatInputValue(selectedDate) : 'MM/DD/YYYY'}</span>
        <CalendarIcon />
      </button>

      {open && (
        <div className="calendar-popover">
          <div className="calendar-header">
            <button type="button" className="calendar-nav" onClick={() => setMonthView(prev => addMonths(prev, -1))}>
              <Chevron direction="up" />
            </button>
            <strong>{formatMonthLabel(monthView)}</strong>
            <button type="button" className="calendar-nav" onClick={() => setMonthView(prev => addMonths(prev, 1))}>
              <Chevron direction="down" />
            </button>
          </div>

          <div className="calendar-weekdays">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map(({ date, outside }) => {
              const disabled = isDisabled(date)
              const selected = isSameDate(date, selectedDate)
              return (
                <button
                  key={toDateKey(date)}
                  type="button"
                  className={`calendar-day ${outside ? 'outside' : ''} ${selected ? 'selected' : ''}`}
                  onClick={() => selectDate(date)}
                  disabled={disabled}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
