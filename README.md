# Mood Space

Mood Space is a full-stack social mood board where users can register, log in, publish short posts, and react to posts from the community. Each post is assigned a mood using keyword-based analysis, helping users see the emotional tone of their own posts and the wider live feed.

## Live Preview

Live preview: _Add the public deployment link here._

## Design Reference

No external design reference is included in this repository.

## Technologies Used

- React
- Vite
- React Router
- Sass
- Axios
- Express
- Node.js
- SQLite via `node:sqlite`
- Docker and Nginx

## Getting Started

### Prerequisites

- Node.js 22 or newer
- npm

### Clone the Repository

```bash
git clone https://github.com/liena-grytsyna/mood_sm.git
cd mood_sm
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Then update `PASSWORD_PEPPER` with a long random value.

### Run Locally

Start the frontend and backend together:

```bash
npm run dev
```

The Vite dev server runs the React app and proxies API requests to the Express server on `http://localhost:4000`.

### Build for Production

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

### Run with Docker

```bash
docker compose up --build
```

The Docker setup serves the app through Nginx on `http://localhost:8081`.

## Available Scripts

- `npm run dev` - start the client and API server in development mode
- `npm run dev:client` - start only the Vite client
- `npm run dev:server` - start only the Express API server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint
- `npm start` - start the API server

## Features

- User registration and login
- Protected profile and post creation pages
- Community feed with all posts
- Personal profile with user-specific posts and mood statistics
- Mood detection for posts using keyword analysis
- Emoji reactions on posts
- Persistent local data storage with SQLite when available
- Dockerized production setup with separate API and web services
