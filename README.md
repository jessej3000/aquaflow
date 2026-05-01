# Watermaster

A water delivery management platform for tracking orders, customers, riders, branches, and inventory.

## Project Structure

```
watermaster/
├── apps/
│   ├── api/          # FastAPI backend (Python)
│   └── ui/           # React frontend (TypeScript + Vite)
```

## Tech Stack

**API**
- Python 3.9+
- FastAPI + Uvicorn
- PostgreSQL via psycopg3
- Strawberry GraphQL
- PyJWT + passlib (bcrypt) for auth

**UI**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Motion (Framer Motion)
- Lucide React icons

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL database

---

### API Setup

```bash
cd apps/api

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
PYTHONPATH=apps/api python3 apps/api/scripts/run_migrations.py

# Start the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
GraphQL playground: `http://localhost:8000/gql`

---

### UI Setup

```bash
cd apps/ui

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start the development server
npm run dev
```

The UI will be available at `http://localhost:3000`.

---

## Environment Variables

### API (`apps/api/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | Algorithm for JWT (default: `HS256`) |
| `JWT_EXPIRE_MINUTES` | Token expiry in minutes |

### UI (`apps/ui/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API (e.g. `http://localhost:8000`) |

---

## Available Scripts

### API

| Command | Description |
|---|---|
| `uvicorn app.main:app --reload` | Start dev server with hot reload |
| `python scripts/run_migrations.py` | Run pending SQL migrations |

### UI

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | TypeScript type check |
| `npm run preview` | Preview production build |
