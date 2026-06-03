# AI Support Bot

AI-powered customer support chatbot for small businesses. Customers scan a QR code or open a link to chat with an AI that answers questions using your business information.

## Features

- 🤖 AI-powered chat (Google Gemini API)
- 📚 Knowledge base management
- 📱 Mobile responsive design
- 🔗 Shareable link + downloadable QR code
- 💬 Chat history & analytics
- 🔐 JWT authentication
- ⚡ Rate limiting & security

## Tech Stack

**Frontend:** React + Vite + Tailwind CSS
**Backend:** Node.js + Express
**Database:** MongoDB Atlas
**AI:** Google Gemini API
**Hosting:** Vercel (frontend) + Render (backend)

## Getting Started

### Local Setup

```bash
# Clone repository
git clone 
cd ai-support-bot

# Frontend
cd client
npm install
npm run dev

# Backend (new terminal)
cd server
npm install
npm run dev
```

### Environment Variables

**server/.env:**
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
CLIENT_URL=http://localhost:5173

**client/.env:**
VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173

## Deployment

- **Frontend:** https://vercel.com
- **Backend:** https://render.com
- **Database:** https://mongodb.com/cloud

## License

MIT