# PinjamIn Frontend

Frontend for the Room Booking System. Built with React, TypeScript, and Vite. This app provides the customer and admin UIs for creating, managing, and approving room bookings.

## Tech Stack
- React 19
- TypeScript
- Vite
- TailwindCSS
- react-datepicker
- react-hot-toast
- date-fns
- Axios

## Requirements
- Node.js 16+ and npm

## Installation
```bash
cd room_booking/frontend
npm install
```

## Configuration
Create a `.env` file in this folder:
```env
VITE_API_BASE_URL=http://localhost:5242/api
VITE_PORT=5173
```

## Run
```bash
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Build
```bash
npm run build
```

## Preview (after build)
```bash
npm run preview
```

## Key Pages
- `CreateBookingsPage`: Create new booking groups with multi-date selection
- `MyBookingsPage`: Customer bookings list with status filters
- `AdminBookingsPage`: Admin management with search and status filters

## Notes
- Multi-date selection: Ctrl/Cmd toggles dates, Shift selects a range
- Status filters separate fully approved/rejected from partially approved/rejected

## Related Docs
- Root README: project overview, backend setup, and API details
```


