## Monorepo — Next.js 15 + Node.js

## Requirements

-Node.js 18+
-npm 8+ (workspace support)

## Installation

npm install

## Development

Run everything together:

npm run dev

Or separately:

npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000

## Environment Variables

Copy the .env.example files and rename them to .env:

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local