# Smart Resume Analyzer — Frontend

This is the React (Vite) frontend application for the Smart Resume Analyzer & Mock Interview Tool.

## Setup & Running Locally
1. Run `npm install`
2. Ensure you have a `.env` file with `VITE_API_BASE_URL=http://localhost:8080` (or your backend URL).
3. Run `npm run dev` to start the frontend on port `3000`.

## ⚠️ Important Deployment Note for Demos ⚠️
**Render AI Service "Sleep" Mode**
The AI service backend hosted on Render's free tier goes to sleep after 15 minutes of inactivity. **The frontend cannot fix this natively.**

**Before showcasing any demo to the team or users, you MUST "warm up" the backend URL by visiting it in your browser at least 1 minute prior.** This gives the Render instance time to spin up and load the Python environment, ensuring the frontend feels blazing fast instead of hanging on the first request!
