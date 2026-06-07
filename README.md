# TwiceNice

> A modern, neobrutalist second-hand marketplace — list what you no longer need, find what someone else
> let go of, and message sellers directly. A lightweight, friendlier alternative to Craigslist.

**Status:** Live.

- **Live app (frontend):** https://twice-nice.vercel.app
- **Live API (backend):** https://twicenice.onrender.com
- **Demo video:** https://drive.google.com/file/d/10xDNRM9kkCnmEtpUzzbvMHQNFNlWvT1x/view?usp=sharing

> Note: the backend runs on Render's free tier, which sleeps after ~15 minutes of inactivity. The first
> request after a sleep can take ~30–50 seconds to wake the server; subsequent requests are fast.

---

## Table of contents
- [What is TwiceNice](#what-is-twicenice)
- [Tech stack](#tech-stack)
- [Features](#features)
- [Design decisions (the full interview)](#design-decisions-the-full-interview)
- [Data model](#data-model)
- [Assumptions](#assumptions)
- [Project structure](#project-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)

---

## What is TwiceNice
TwiceNice is a second-hand marketplace web platform. Users can sign up, post items for sale (with photos,
price, category, condition, location), browse and search everyone's listings with rich filters, save
favorites, and chat with sellers through an in-app messaging inbox. Sellers manage their own listings from a
dashboard and mark items as sold. An admin can manage the category tree, remove listings, and ban users.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| **Backend** | Node.js + Express (plain JavaScript) | Minimal boilerplate, huge ecosystem, easy free-tier deploy |
| **Database** | MongoDB Atlas + Mongoose | Flexible documents, fast to model, generous free tier |
| **Auth** | Roll-your-own JWT (bcrypt + jsonwebtoken) | Single ~7-day access token; learn auth end-to-end |
| **Images** | Cloudinary (upload via backend + multer) | Keeps secrets server-side, validation in our control |
| **Validation** | express-validator | Declarative per-route validation; strict password rules |
| **Frontend** | React + Vite (plain JS) | Fast SPA that talks to the REST API; simple Vercel deploy |
| **Styling** | Tailwind CSS + shadcn/ui | Custom, consistent UI with full design control |
| **Aesthetic** | **Neobrutalism** | Bold black borders, hard offset shadows, flat saturated fills, chunky type |
| **Hosting** | Render (backend) + Vercel (frontend) | Free tiers, GitHub auto-deploy |
| **Repo** | Monorepo (`/backend` + `/frontend`) | One place for everything |

---

## Features
- **Authentication** — signup, login, JWT sessions, protected routes.
- **Listings** — create with up to 5 images (first = cover), edit/delete your own, mark as sold (stays
  visible with a SOLD badge).
- **Browse & discovery** — keyword search (title + description + tags), filter by category/subcategory,
  price range, condition, location, and hide-sold; sort by newest / price / relevance; paginated (12/page).
- **Messaging** — in-app buyer↔seller inbox with threads scoped per listing, near-real-time via polling,
  unread badge.
- **Profiles** — public seller profile (name, location, member-since, their active + sold listings) and a
  personal dashboard to manage your listings.
- **Favorites / wishlist** — save listings for later.
- **Admin** — manage the category tree, remove any listing, ban users (via a protected admin page).

---

## Design decisions (the full interview)
Every choice below was made deliberately during a design interview before any code was written.
The verbatim question-by-question record (with the exact options chosen) lives in [DECISIONS.md](DECISIONS.md).

### Architecture & infrastructure
- **Backend language/framework:** Node.js + Express, **plain JavaScript** (no TypeScript).
- **Database:** MongoDB + Mongoose.
- **API style:** REST, with **plain JSON** responses (return the resource directly; errors as
  `{ "error": "..." }` with proper HTTP status codes).
- **Repo layout:** Monorepo with `/backend` and `/frontend` folders.
- **Backend hosting:** Render (free tier). **Frontend hosting:** Vercel.
- **Backend folder structure:** Layered — `routes / controllers / models / middleware / utils`.
- **API testing/docs:** Postman collection + a `.http` request file (backend-first workflow).

### Frontend & look-and-feel
- **Framework:** **React + Vite** single-page app (plain JavaScript).
- **Styling:** **Tailwind CSS** + **shadcn-style** components (the component code lives in the repo, not a
  dependency).
- **Aesthetic:** **Neobrutalism** — bold black borders, hard offset shadows, flat saturated/pastel fills,
  chunky type (Space Grotesk headings), high contrast, minimal gradients.
- **Currency:** **₹ INR**, formatted client-side; stored as a plain number.

### Authentication
- **Strategy:** Roll-your-own **JWT** — bcrypt password hashing, a signed JWT issued on login.
- **Token lifetime:** Single access token, **~7-day expiry** (no refresh tokens).
- **Token storage (client):** `localStorage`, sent as `Authorization: Bearer <token>`.
- **Login identifier:** **Email only** (no username, no social login).
- **Password rules:** **Strict** — minimum **8 characters**, with an uppercase letter, a lowercase letter, a
  number, and a symbol (enforced on the API and mirrored as a live checklist on signup/password-change).

### Users & profiles
- **User fields:** name, email, password, **phone**, **location** (no avatar upload, no bio).
- **Avatars:** auto-generated **initials** avatar (no file upload).
- **Public profile shows:** name, location, member-since, and the seller's active + sold listings.
  Phone is **private** (not shown publicly).
- **Dashboard:** "My listings" with Active/Sold tabs, edit/delete/mark-sold actions, and an inbox link.
- **Account self-service:** edit profile fields **and** change password.

### Listings
- **Required fields:** title, description, price, category, images.
- **Plus:** condition (New / Like New / Good / Fair), location, quantity, and free-text **tags**.
- **Images:** **multiple (up to 5)** per listing, first image is the cover.
- **Price:** numeric in a single currency, with a **"negotiable"** flag and support for **"Free"** (price 0).
- **Placement:** a listing must be assigned to a **subcategory** (a leaf), never a bare top-level category.
- **Sold behavior:** sold listings **stay visible** with a SOLD badge (history preserved). Marking sold is a
  **toggle** — the same control marks an item sold or relists it as active.

### Categories
- **Structure:** 2-level hierarchy — **Category → Subcategory** (e-commerce style, without infinite nesting).
- **Per-category attributes:** none — the shared **tags** field covers extra detail.
- **Management:** **admin-managed** CRUD (stored in the DB), surfaced through a frontend admin page.
- **Read endpoint:** `GET /api/categories` returns the **nested tree** — top-level categories each with a
  `subcategories` array.
- **Editing:** admin can **rename** a category; moving a category to a different parent is not supported.
- **Deletion:** **blocked (409)** if the category still has subcategories or listings (no orphaning).

### Browse, search & discovery
- **Search:** MongoDB **text index** over title + description + tags.
- **Filters:** category/subcategory, price range, condition, **location**, and **hide-sold** (combinable).
- **Sorting:** Newest, Price ↑, Price ↓, and Relevance (when searching).
- **Paging:** classic **pagination** (page numbers, 12 per page).

### Seller interaction (messaging)
- **Mechanism:** **in-app messaging** — a buyer↔seller inbox with conversation threads.
- **Delivery:** **polling** (frontend refetches every few seconds) — no WebSocket infra needed.
- **Thread model:** one conversation per **(listing + buyer)** for clear per-item context.
- **Who starts:** only a **buyer** (non-seller) can open a thread; you can't message your own listing.
- **Read state:** opening a conversation marks the other party's messages read (no separate endpoint).
- **Notifications:** the navbar badge counts the **number of conversations with unread messages**.

### Admin & roles
- **Role model:** an **`isAdmin` boolean** on the user.
- **Bootstrap:** a seed/promote script marks a known **`ADMIN_EMAIL`** account as admin (no self-signup).
- **Powers:** manage categories + remove any listing + **ban users**.
- **Surface:** a protected **admin page** in the frontend.

### Image uploads
- **Storage:** **Cloudinary** (free tier).
- **Flow:** client → **backend (multer)** → Cloudinary (secrets stay server-side; we validate size/type).

### Extras & process
- **Extra feature:** **Favorites / wishlist**.
- **Seed data:** rich demo data (users, full category tree, ~20–30 listings, a sample conversation).
- **Testing:** manual (Postman + UI), no automated test suite.
- **Scope stance:** full scope; sequenced carefully and reassessed as we go.

---

## Data model
- **User** — `name`, `email` (unique, lowercased), `passwordHash`, `phone`, `location`, `isAdmin` (default
  false), `isBanned` (default false), timestamps.
- **Category** — `name`, `parent` (ref to a top-level category, or `null`) → enforces 2 levels. A compound
  unique index on `(name, parent)` prevents duplicate sibling names.
- **Listing** — `title`, `description`, `price`, `isFree`, `negotiable`, `category` (ref to a subcategory),
  `condition`, `location`, `quantity`, `tags[]`, `images[]` (≤5, `[0]` = cover), `status` (`active`/`sold`),
  `seller` (ref), timestamps. Text index on (title, description, tags).
- **Conversation** — `listing` (ref), `buyer` (ref), `seller` (ref); unique per (listing, buyer).
- **Message** — `conversation` (ref), `sender` (ref), `body`, `read`, timestamp.
- **Favorite** — `user` (ref) + `listing` (ref), unique pair.

---

## Assumptions
- Email is the unique login identifier; no username/social login.
- At signup, `name`, `email`, `password`, and `location` are required; `phone` is optional (it is private and
  contact happens via in-app messaging, while `location` is required because it powers the browse filters).
- One currency (₹), formatted on the client; stored as a plain number.
- Banned users are blocked from logging in and from all write actions; their listings remain unless removed
  by an admin.
- A "Free" listing has price 0 and displays as "Free"; `negotiable` is an independent flag.
- Admin accounts are bootstrapped via a seed/promote script keyed on `ADMIN_EMAIL` — there is no way to sign
  up as an admin.
- Render's free tier sleeps when idle, so the first request after inactivity may take ~30s (cold start).

---

## Project structure
```
TwiceNice/
├── backend/            # Node + Express REST API
│   └── src/
│       ├── config/         # db, cloudinary
│       ├── controllers/    # request handlers
│       ├── middleware/     # auth, admin, errors, uploads
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routers
│       ├── utils/          # helpers
│       ├── app.js          # express app wiring
│       ├── server.js       # entry point
│       ├── seed.js         # demo-data seed script
│       └── data/           # seed image URLs
├── frontend/           # React + Vite SPA
│   └── src/
│       ├── components/     # Navbar, Layout, ListingCard, ui/ primitives
│       ├── context/        # Auth, Favorites, Toast providers
│       ├── pages/          # Home, ListingDetail, Dashboard, Messages, Admin, …
│       ├── lib/            # api client, formatters
│       ├── App.jsx         # routes
│       └── main.jsx        # entry + providers
└── README.md
```

---

## Local setup
Run the backend and frontend in two terminals.

### Backend
```bash
cd backend
cp .env.example .env      # then fill in the values
npm install
npm run seed -- --fresh   # optional: populate demo data (users, categories, listings)
npm run dev               # starts the API on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env      # defaults to http://localhost:5000/api
npm install
npm run dev               # starts the app on http://localhost:5173
```

---

## Environment variables
Backend (`backend/.env`):

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_ORIGIN` | Allowed CORS origin (the frontend URL, no trailing slash) |
| `ADMIN_EMAIL` | Email promoted to admin by the seed script |

Frontend (`frontend/.env`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000/api`, or the Render URL in production). Baked in at build time. |

---

## Deployment
- **Backend → Render** (web service, root directory `backend`, build `npm install`, start `npm start`).
  Set all backend env vars in the Render dashboard, with `CLIENT_ORIGIN` = the Vercel URL (no trailing slash).
- **Frontend → Vercel** (root directory `frontend`, framework Vite). Set `VITE_API_URL` = the Render URL + `/api`,
  then redeploy so it's baked into the build. `vercel.json` rewrites all routes to `index.html` for the SPA.
- **Database → MongoDB Atlas**; add `0.0.0.0/0` to Network Access so Render can connect.
- **Images → Cloudinary** (credentials in the backend env).

---

## API overview
Base path: `/api`. Auth is a Bearer JWT in the `Authorization` header. Ready-to-run request collections live
in [backend/requests.http](backend/requests.http) (VS Code REST Client) and
[backend/TwiceNice.postman_collection.json](backend/TwiceNice.postman_collection.json) (Postman).

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/auth/register` | — | Sign up |
| POST | `/auth/login` | — | Log in (returns user + token) |
| GET | `/auth/me` | user | Current user |
| PATCH | `/users/me` | user | Edit own profile |
| PATCH | `/users/me/password` | user | Change password |
| GET | `/users/:id` | — | Public profile + that seller's listings |
| GET | `/categories` | — | Category tree (top-level + subcategories) |
| POST/PATCH/DELETE | `/categories[/:id]` | admin | Manage categories |
| POST | `/uploads` | user | Upload up to 5 images → Cloudinary URLs |
| GET | `/listings` | — | Browse: search, filters, sort, pagination |
| GET | `/listings/mine` | user | My listings (dashboard) |
| POST | `/listings` | user | Create a listing |
| GET | `/listings/:id` | — | Listing detail |
| PATCH/DELETE | `/listings/:id` | owner | Edit / delete own listing |
| PATCH | `/listings/:id/sold` | owner | Toggle sold ↔ active |
| GET | `/favorites` | user | My saved listings |
| POST/DELETE | `/favorites/:listingId` | user | Add / remove a favorite |
| POST | `/conversations` | user | Start/continue a thread about a listing |
| GET | `/conversations` | user | Inbox (with unread counts) |
| GET | `/conversations/unread-count` | user | Navbar unread badge |
| GET | `/conversations/:id/messages` | participant | Thread messages (marks read) |
| POST | `/conversations/:id/messages` | participant | Send a message |
| GET | `/admin/users` · `/admin/listings` | admin | Moderation lists |
| DELETE | `/admin/listings/:id` | admin | Remove any listing |
| PATCH | `/admin/users/:id/ban` | admin | Ban / unban a user |
