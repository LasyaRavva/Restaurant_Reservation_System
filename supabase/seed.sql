-- ============================================================
-- SEED: restaurants
-- ============================================================

INSERT INTO restaurants (id, name, cuisine_type, description, address, city, capacity, image_url) VALUES
(
  'a1b2c3d4-0000-0000-0000-000000000001',
  'The Spice Garden',
  'Indian',
  'Authentic North and South Indian cuisine in a warm, family setting.',
  '12 MG Road', 'Bangalore', 60,
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800'
),
(
  'a1b2c3d4-0000-0000-0000-000000000002',
  'Sakura Bistro',
  'Japanese',
  'Modern Japanese cuisine — sushi, ramen, and omakase tasting menus.',
  '45 Jubilee Hills', 'Hyderabad', 40,
  'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800'
),
(
  'a1b2c3d4-0000-0000-0000-000000000003',
  'Terra Italiana',
  'Italian',
  'Wood-fired pizzas, fresh pasta, and classic Italian wines.',
  '8 Banjara Hills', 'Hyderabad', 50,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
);


-- ============================================================
-- SEED: menu_items for The Spice Garden
-- ============================================================

INSERT INTO menu_items (restaurant_id, name, description, price, category, is_vegetarian) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'Paneer Tikka', 'Cottage cheese marinated in spiced yoghurt, grilled in tandoor.', 320.00, 'starters', true),
('a1b2c3d4-0000-0000-0000-000000000001', 'Chicken 65', 'Crispy deep-fried chicken with curry leaves and green chillies.', 380.00, 'starters', false),
('a1b2c3d4-0000-0000-0000-000000000001', 'Dal Makhani', 'Slow-cooked black lentils in a buttery tomato gravy.', 280.00, 'mains', true),
('a1b2c3d4-0000-0000-0000-000000000001', 'Butter Chicken', 'Tender chicken in a rich, creamy tomato sauce.', 420.00, 'mains', false),
('a1b2c3d4-0000-0000-0000-000000000001', 'Gulab Jamun', 'Soft milk-solid dumplings in rose-scented sugar syrup.', 150.00, 'desserts', true),
('a1b2c3d4-0000-0000-0000-000000000001', 'Mango Lassi', 'Chilled yoghurt drink blended with Alphonso mango.', 120.00, 'drinks', true);


-- ============================================================
-- SEED: menu_items for Sakura Bistro
-- ============================================================

INSERT INTO menu_items (restaurant_id, name, description, price, category, is_vegetarian) VALUES
('a1b2c3d4-0000-0000-0000-000000000002', 'Edamame', 'Steamed salted soybeans.', 180.00, 'starters', true),
('a1b2c3d4-0000-0000-0000-000000000002', 'Gyoza', 'Pan-fried pork and cabbage dumplings with ponzu dip.', 320.00, 'starters', false),
('a1b2c3d4-0000-0000-0000-000000000002', 'Tonkotsu Ramen', 'Rich pork bone broth with chashu, soft egg, and nori.', 580.00, 'mains', false),
('a1b2c3d4-0000-0000-0000-000000000002', 'Salmon Sashimi', 'Eight slices of fresh Atlantic salmon.', 620.00, 'mains', false),
('a1b2c3d4-0000-0000-0000-000000000002', 'Matcha Ice Cream', 'Two scoops of ceremonial-grade matcha gelato.', 220.00, 'desserts', true),
('a1b2c3d4-0000-0000-0000-000000000002', 'Yuzu Lemonade', 'House-pressed lemonade with yuzu zest.', 180.00, 'drinks', true);


-- ============================================================
-- ADMIN NOTE
-- Promote one authenticated profile to admin after sign up:
-- UPDATE profiles SET is_admin = TRUE WHERE id = '<auth user uuid>';
-- ============================================================
