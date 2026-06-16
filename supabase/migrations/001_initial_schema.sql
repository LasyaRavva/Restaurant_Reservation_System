-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE reservation_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled'
);

CREATE TYPE meal_category AS ENUM (
  'starters',
  'mains',
  'desserts',
  'drinks',
  'sides'
);


-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users (one row per registered user)
-- ============================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- TABLE: restaurants
-- ============================================================

CREATE TABLE restaurants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  cuisine_type   TEXT NOT NULL,
  description    TEXT,
  address        TEXT NOT NULL,
  city           TEXT NOT NULL,
  phone          TEXT,
  email          TEXT,
  image_url      TEXT,
  capacity       INTEGER NOT NULL DEFAULT 50,
  opening_hours  JSONB NOT NULL DEFAULT '{
    "mon": "12:00-22:00",
    "tue": "12:00-22:00",
    "wed": "12:00-22:00",
    "thu": "12:00-22:00",
    "fri": "12:00-23:00",
    "sat": "11:00-23:00",
    "sun": "11:00-21:00"
  }',
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: menu_items
-- ============================================================

CREATE TABLE menu_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  price          NUMERIC(8, 2) NOT NULL,
  category       meal_category NOT NULL,
  image_url      TEXT,
  is_available   BOOLEAN DEFAULT TRUE,
  is_vegetarian  BOOLEAN DEFAULT FALSE,
  is_vegan       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category   ON menu_items(restaurant_id, category);


-- ============================================================
-- TABLE: reservations
-- ============================================================

CREATE TABLE reservations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id    UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  time_slot        TIME NOT NULL,
  party_size       INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 20),
  status           reservation_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_user       ON reservations(user_id);
CREATE INDEX idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX idx_reservations_date       ON reservations(restaurant_id, date);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see and edit their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (public.is_admin());

-- Restaurants: anyone can read (even logged-out users)
CREATE POLICY "Restaurants are publicly readable"
  ON restaurants FOR SELECT USING (true);

CREATE POLICY "Admins can manage restaurants"
  ON restaurants FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Menu items: anyone can read
CREATE POLICY "Menu items are publicly readable"
  ON menu_items FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu items"
  ON menu_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Reservations: users can only see/modify their own
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reservations"
  ON reservations FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
