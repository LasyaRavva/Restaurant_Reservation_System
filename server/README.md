# Server

This folder contains the backend API for the reservation system.

## Structure

- `src/app.js` - Express app setup
- `src/server.js` - App bootstrap
- `src/config/` - Environment and client setup
- `src/routes/` - API route definitions
- `src/controllers/` - HTTP request handlers
- `src/services/` - Business logic and provider integration
- `src/middleware/` - Error handling and request middleware
- `src/utils/` - Shared helpers

## Current scope

- Reservation endpoints
- Payment integration hooks for Stripe or Razorpay
- Email notification hooks for reservation confirmations

## Setup

1. Copy `.env.example` to `.env`
2. Fill in the Supabase and provider keys
3. Run:

```bash
npm install
npm run dev
```
