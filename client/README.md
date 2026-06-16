# 🍽 TableBook — Restaurant Reservation System

A full-stack restaurant booking platform built with React, Vite, and Supabase.
Users can browse restaurants, view menus, and make table reservations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Styling | Plain CSS (DM Sans + Fraunces) |
| Deployment | Vercel (frontend) |

---

## Project Structure

```
restaurant-reservation-system/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, ProtectedRoute
│   │   │   ├── restaurant/      # RestaurantCard, CuisineFilter
│   │   │   ├── menu/            # MenuCard
│   │   │   └── dashboard/       # ReservationCard
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useRestaurants.js
│   │   │   ├── useMenu.js
│   │   │   └── useReservations.js
│   │   ├── lib/
│   │   │   └── supabaseClient.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── RestaurantDetail.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyReservations.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Auth.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.local
│   ├── index.html
│   └── package.json
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A free [Supabase](https://supabase.com) account

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/restaurant-reservation-system.git
cd restaurant-reservation-system
```

---

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (~1 min)
3. In the left sidebar, click **SQL Editor**
4. Open `supabase/migrations/001_initial_schema.sql` and paste the full contents into the editor — click **Run**
5. Open `supabase/seed.sql` and paste the full contents — click **Run**
6. Go to **Project Settings → API**
7. Copy your **Project URL** and **anon public key** — you'll need these in the next step

---

### 3. Configure environment variables

Inside the `client/` folder, create a file called `.env.local`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> Never commit `.env.local` to Git. It's already in `.gitignore`.

---

### 4. Install dependencies and run

```bash
cd client
npm install
npm run dev
```

The app will be running at **http://localhost:5173**

---

## Pages & Routes

| Route | Page | Auth required |
|---|---|---|
| `/` | Home — browse restaurants | No |
| `/restaurants/:id` | Restaurant detail + hours | No |
| `/restaurants/:id/menu` | Menu browsing with category tabs | No |
| `/auth` | Login / Register | No |
| `/restaurants/:id/book` | Make a reservation | Yes |
| `/dashboard` | User dashboard overview | Yes |
| `/dashboard/reservations` | View and cancel bookings | Yes |
| `/dashboard/profile` | Edit name and phone | Yes |

---

## Database Schema

### Tables

**`profiles`** — extends `auth.users`, created automatically on signup via a Postgres trigger
- `id` (uuid, FK → auth.users)
- `name`, `phone`, `avatar_url`, `created_at`

**`restaurants`**
- `id`, `name`, `cuisine_type`, `description`, `address`, `city`
- `phone`, `email`, `image_url`, `capacity`
- `opening_hours` (jsonb — e.g. `{ "mon": "12:00-22:00" }`)
- `is_active`, `created_at`

**`menu_items`**
- `id`, `restaurant_id` (FK), `name`, `description`, `price`
- `category` (enum: starters / mains / sides / desserts / drinks)
- `is_available`, `is_vegetarian`, `is_vegan`

**`reservations`**
- `id`, `user_id` (FK), `restaurant_id` (FK)
- `date`, `time_slot`, `party_size`
- `status` (enum: pending / confirmed / cancelled)
- `special_requests`, `created_at`, `updated_at`

### Relationships

```
auth.users  ──<  profiles         (1 user → 1 profile, via trigger)
auth.users  ──<  reservations     (1 user → many reservations)
restaurants ──<  menu_items       (1 restaurant → many menu items)
restaurants ──<  reservations     (1 restaurant → many reservations)
```

### Row Level Security

| Table | Public read | Write |
|---|---|---|
| `restaurants` | ✅ Yes | Admin only |
| `menu_items` | ✅ Yes | Admin only |
| `profiles` | Own row only | Own row only |
| `reservations` | Own rows only | Own rows only |

---

## Key Features

- Browse restaurants filtered by cuisine type or name search
- View full menu grouped by category (Starters / Mains / Desserts / Drinks)
- JWT-based auth via Supabase — register, login, logout
- Make a reservation with date, time slot, party size, and special requests
- User dashboard showing upcoming and past bookings
- Cancel upcoming reservations
- Edit profile (name, phone)
- Protected routes — unauthenticated users are redirected to `/auth`

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Set **Root Directory** to `client`
4. Add environment variables in Vercel's dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

---

## Supabase Auth — Email Confirmation

By default Supabase requires email confirmation before login works.

To disable it during development:
1. Go to **Supabase Dashboard → Authentication → Providers → Email**
2. Toggle off **Confirm email**

Re-enable this before going to production.

---

## Git Commit History (suggested)

```
feat: initial vite + react project setup
feat: supabase client and environment config
feat: database schema and seed data
feat: auth context with login, register, signout
feat: useRestaurants and useRestaurant hooks
feat: useMenu hook with category grouping
feat: useReservations hook with create and cancel
feat: home page with search and cuisine filter
feat: restaurant card component
feat: restaurant detail page with opening hours
feat: menu page with category tabs
feat: menu card component with veg/vegan tags
feat: booking page with time slot picker
feat: user dashboard with stats
feat: my reservations page with cancel flow
feat: profile settings page
feat: protected route guard
feat: complete css styling
docs: readme with setup and deployment guide
```

---

## Environment Variables Reference

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |

---

## License

MIT