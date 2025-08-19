# 🎯 AI-Powered Session Booking System

A smart conference session recommendation system that uses AI to suggest the perfect learning schedule based on your preferences.

## ✨ What This Does

- **Smart Recommendations**: AI analyzes your industry and interests to suggest relevant sessions
- **Conflict-Free Scheduling**: Automatically avoids time conflicts and minimizes gaps
- **Calendar Integration**: Download your schedule as a .ics file for any calendar app
- **Real-time Booking**: Instant session booking with availability checking

## 🚀 Quick Start (5 Minutes!)

### 1. **Clone & Install**
```bash
git clone <your-repo-url>
cd DOM-POC-Clean
npm install  # Installs both backend and frontend dependencies
```

### 2. **Set Up Database**
- Create a free account at [Supabase](https://supabase.com)
- Create a new project
- Go to SQL Editor and run the contents of `database_extended.sql`
- Then run `populate_database.sql` to add sample sessions

### 3. **Configure Environment** ⚠️ **IMPORTANT: NEVER COMMIT YOUR .env FILE!**
```bash
cp env-template.txt .env
```
Edit `.env` with your keys:
```env
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

**Get Your Keys:**
- **Supabase**: Project Settings → API → URL & anon key
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**🔒 Security Note**: The `.env` file contains sensitive API keys and is automatically ignored by Git. Never share or commit this file!

### 4. **Start the App**
```bash
# Option 1: Start both backend and frontend together
npm run dev:full

# Option 2: Start them separately
# Terminal 1: Backend only
npm run dev

# Terminal 2: Frontend only  
npm run dev:frontend
```

### 5. **Use the App**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Select your industry (Marketing, Tech, etc.)
- Choose your focus areas
- Pick your available times
- Get AI-optimized session recommendations!

## 🎨 Features

### 🤖 **AI-Powered Matching**
- **Strict Algorithm**: Only shows sessions that match your exact preferences
- **Smart Scoring**: Prioritizes exact matches over partial ones
- **Category Filtering**: Maps your industry to relevant session categories
- **LLM Optimization**: Uses GPT to reorder sessions for optimal learning flow

### 📅 **Smart Scheduling**
- **Conflict Detection**: Prevents overlapping session bookings
- **Gap Minimization**: Reduces downtime between sessions
- **Time Preferences**: Respects your available time windows
- **Calendar Export**: Download .ics files for any calendar app

### 🎯 **User-Friendly**
- **Step-by-Step Form**: Easy 4-step booking process
- **Real-time Feedback**: Instant availability checking
- **Visual Schedule**: Clear session timeline view
- **Mobile Responsive**: Works on all devices

## 🏗️ Project Structure

```
DOM-POC-Clean/
├── server.js                 # Backend API with AI logic
├── database_extended.sql     # Database schema
├── populate_database.sql     # Sample data
├── .env                     # Your configuration
├── package.json             # Main project dependencies
└── frontend/                # React frontend
    ├── src/
    │   ├── components/
    │   │   └── SchedulingForm.tsx  # Main booking interface
    │   ├── services/
    │   │   └── api.ts          # API service layer
    │   └── pages/
    └── package.json           # Frontend dependencies
```

## 🔧 How It Works

### Backend (Node.js + Express)
1. **CategoryRouter**: Maps user industry to session categories
2. **SessionMatcher**: Scores sessions based on relevance (0-7 scale)
3. **LLMOptimizer**: Uses OpenAI to reorder sessions intelligently
4. **SessionArranger**: Removes conflicts and minimizes gaps

### Frontend (React + TypeScript)
1. **Industry Selection**: Marketing, Tech, Sales, Finance
2. **Focus Areas**: Specific skills/topics within industry
3. **Time Preferences**: Available time windows
4. **AI Optimization**: Toggle for LLM-powered reordering

### AI Algorithm
```
Score = 5.0 × Relevance + 2.0 × Time Fit + 0.3 × Freshness + 0.2 × Availability

Where:
- Relevance = max(tag_overlap, category_match)
- Only sessions with score > 0.5 are considered
- LLM reorders high-scoring sessions for optimal learning
```

## 🎯 Industries & Categories

| Industry | Supported Categories |
|----------|---------------------|
| **Marketing** | Digital Marketing, Content Marketing, Social Media, Email Marketing |
| **Technology** | Web Development, Data Science, DevOps, Product Management |
| **Sales** | Sales Techniques, CRM, Lead Generation |
| **Finance** | Financial Planning, Investment, Accounting |

## 🔒 Security & Best Practices

### **🚨 NEVER COMMIT THESE FILES:**
- `.env` - Contains your API keys
- Any files with actual API keys or passwords
- Database dumps with real user data

### **✅ Safe to Commit:**
- `env-template.txt` - Template with placeholder values
- All source code files
- Database schema files (without real data)

### **🛡️ Security Checklist:**
- [ ] `.env` file is in `.gitignore`
- [ ] API keys are never hardcoded in source files
- [ ] Use environment variables for all sensitive data
- [ ] Regularly rotate your API keys
- [ ] Use different keys for development vs production

### **🔑 API Key Management:**
- **Development**: Use separate API keys from production
- **Team Sharing**: Share the `env-template.txt`, never the actual `.env`
- **Deployment**: Set environment variables in your hosting platform
- **Rotation**: Change keys periodically and update in all environments

## 🚨 Troubleshooting

### Common Issues

**"No sessions found"**
- Make sure you ran `populate_database.sql`
- Check your Supabase connection

**"LLM optimization failed"**
- Verify your OpenAI API key is correct
- Check you have API credits

**Frontend won't start**
- Try running `npm run install:frontend` to reinstall frontend deps
- Try a different port if 5173 is busy

**Backend errors**
- Check all environment variables are set
- Ensure Supabase URL includes `https://`

### Debug Endpoints
- **Health Check**: http://localhost:3000/health
- **Database Test**: http://localhost:3000/api/debug/sessions

## 🌟 Example Usage

```bash
# Test the API directly
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "tech",
    "focus": ["web development"],
    "useLLM": true,
    "topK": 5
  }'
```

## 📱 Screenshots

The app features a clean, minimalist design with:
- **Step-by-step wizard** for easy booking
- **AI optimization indicator** when LLM is used
- **Session cards** with instructor, time, and relevance info
- **Calendar download** for seamless integration

## 🤝 Contributing

### **Before You Commit:**
1. **Check `.gitignore`**: Ensure sensitive files are ignored
2. **Remove API Keys**: Never hardcode keys in source files
3. **Test Locally**: Verify everything works with your `.env` file
4. **Clean Commit**: Only commit source code, not secrets

### **Contribution Steps:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes (follow security practices above)
4. Test with different industries/preferences
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Submit a pull request

### **🔍 Pre-Commit Checklist:**
- [ ] No `.env` files in commit
- [ ] No API keys in source code
- [ ] All secrets use environment variables
- [ ] `.gitignore` is up to date
- [ ] Code follows existing patterns

## 📄 License

MIT License - feel free to use this for your own projects!

---

**Need Help?** 
- Check the troubleshooting section above
- Look at the debug endpoints
- Ensure all environment variables are set correctly
