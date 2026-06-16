export default function MenuCard({ item }) {
  const { name, description, price, is_vegetarian, is_vegan, image_url } = item

  return (
    <div className="menu-card">
      {image_url && (
        <div className="menu-card-image">
          <img src={image_url} alt={name} />
        </div>
      )}
      <div className="menu-card-body">
        <div className="menu-card-top">
          <h4>{name}</h4>
          <span className="price">₹{Number(price).toFixed(2)}</span>
        </div>
        <p className="menu-desc">{description}</p>
        <div className="menu-tags">
          {is_vegan && <span className="tag vegan">Vegan</span>}
          {is_vegetarian && !is_vegan && <span className="tag veg">Veg</span>}
        </div>
      </div>
    </div>
  )
}