# Deploy to Supabase Edge Functions

This guide will help you deploy your session booking backend as Supabase Edge Functions.

## Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project setup:**
   - Have your Supabase project URL and keys ready
   - Database tables already created (sessions, bookings)

## Setup Steps

### 1. Login to Supabase CLI
```bash
supabase login
```

### 2. Link your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
Find your project ref in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 3. Set Environment Variables
Update `.env.local` with your actual Supabase credentials:
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy recommendations
supabase functions deploy book
supabase functions deploy ics
supabase functions deploy bookings
supabase functions deploy health
```

### 5. Set Secrets (Environment Variables)
```bash
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
```

## Edge Functions Created

1. **`recommendations`** - POST `/functions/v1/recommendations`
   - Get AI-powered session recommendations
   - Input: industry, focus areas, time preferences

2. **`book`** - POST `/functions/v1/book`
   - Book selected sessions
   - Input: session IDs, user details

3. **`ics`** - GET `/functions/v1/ics?bookingId=xxx`
   - Download calendar file for booking
   - Returns ICS calendar file

4. **`bookings`** - GET `/functions/v1/bookings?userId=xxx`
   - Get user's booking history
   - Returns list of user bookings

5. **`health`** - GET `/functions/v1/health`
   - Health check endpoint
   - Returns service status

## Testing Your Functions

### Test Health Check
```bash
curl https://your-project-ref.supabase.co/functions/v1/health
```

### Test Recommendations
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "industry": "technology",
    "focus": ["web development", "frontend"],
    "topK": 5
  }'
```

## Frontend Integration

Update your frontend API calls to use the new Edge Function URLs:

**Before (Express server):**
```javascript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**After (Supabase Edge Functions):**
```javascript
const response = await fetch('https://your-project-ref.supabase.co/functions/v1/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify(data)
});
```

## Function URLs

Replace `your-project-ref` with your actual Supabase project reference:

- Recommendations: `https://your-project-ref.supabase.co/functions/v1/recommendations`
- Book: `https://your-project-ref.supabase.co/functions/v1/book`
- ICS Download: `https://your-project-ref.supabase.co/functions/v1/ics?bookingId=xxx`
- User Bookings: `https://your-project-ref.supabase.co/functions/v1/bookings?userId=xxx`
- Health Check: `https://your-project-ref.supabase.co/functions/v1/health`

## Deploy Frontend to Vercel

Your frontend can still be deployed to Vercel, but now it will call Supabase Edge Functions instead of Vercel API routes.

1. Remove the `/api` folder (no longer needed)
2. Update frontend API calls to use Supabase Edge Function URLs
3. Deploy to Vercel as usual:
   ```bash
   vercel
   ```

## Benefits of Supabase Edge Functions

✅ **Global Edge Network** - Functions run close to your users worldwide  
✅ **Integrated with Database** - Direct access to your Supabase database  
✅ **TypeScript Support** - Full TypeScript support with Deno runtime  
✅ **Auto-scaling** - Automatically scales based on demand  
✅ **Cost Effective** - Pay only for what you use  

## Troubleshooting

- Check function logs: `supabase functions logs`
- Verify secrets are set: `supabase secrets list`
- Test locally: `supabase functions serve`
- Check CORS headers if having browser issues

Your session booking system is now running on Supabase's global edge network! 🚀