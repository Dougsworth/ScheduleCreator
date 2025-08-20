# Lovely Input Vue - Session Booking System

A modern session booking system with AI-powered recommendations built with React and Express.js, ready for deployment on Vercel.

## 🚀 Deployment

This project is configured for deployment on Vercel with the backend running as edge functions.

### Prerequisites

1. Supabase account and database set up
2. Vercel account

### Environment Variables

Set the following environment variables in your Vercel deployment:

```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here (optional)
NODE_ENV=production
```

### Deploy to Vercel

1. **Connect your repository to Vercel:**
   ```bash
   # Install Vercel CLI (if not already installed)
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Or use the Vercel dashboard:**
   - Import your GitHub repository
   - Vercel will automatically detect the configuration from `vercel.json`
   - Add your environment variables in the Vercel dashboard

### Project Structure

```
├── api/                 # Edge function backend
│   ├── index.js        # Main API handler
│   └── package.json    # API dependencies
├── frontend/           # React frontend
│   ├── src/           # Source code
│   ├── dist/          # Built files (generated)
│   └── package.json   # Frontend dependencies
├── vercel.json        # Vercel configuration
└── .env.example       # Environment template
```

## 🛠️ Local Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Full Stack Development

```bash
# From root directory
npm install
npm run dev:full
```

## 📋 API Endpoints

- `POST /api/recommendations` - Get session recommendations
- `POST /api/book` - Book sessions
- `GET /api/ics/:bookingId` - Download calendar file
- `GET /api/bookings/:userId` - Get user bookings
- `GET /api/debug/sessions` - Debug database connection

## 🔧 Configuration

The project uses:
- **Frontend**: React with Vite, TypeScript, Tailwind CSS
- **Backend**: Express.js optimized for edge functions
- **Database**: Supabase
- **Deployment**: Vercel

## 📊 Features

- AI-powered session recommendations
- Intelligent scheduling with conflict resolution
- Calendar integration (ICS files)
- Real-time availability checking
- Responsive design with shadcn/ui components

## 🔒 Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Optionally add OpenAI API key for enhanced features

## 🚦 Health Check

Visit `/health` to check API status after deployment.