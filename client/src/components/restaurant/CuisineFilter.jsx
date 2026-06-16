export default function CuisineFilter({ cuisines, active, onChange }) {
  return (
    <div className="cuisine-filter">
      {cuisines.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`filter-chip ${(active === c || (!active && c === 'All')) ? 'active' : ''}`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}