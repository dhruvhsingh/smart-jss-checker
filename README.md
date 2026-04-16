# Smart JSS Readiness Checker

Mobile-first web app for Jio Smart JSS field readiness verification.
Field staff upload a photo with their PRM ID. The system runs a vision model
locally (no external AI API, no rate limits, no per-request cost) and checks:

1. **Female** — Is the person female?
2. **Jio Jacket** — Is the blue Jio jacket being worn?
3. **Laminated Paper** — Is the correct Jio promotional paper being held?

## Architecture

| Layer | Service | Cost |
|---|---|---|
| Frontend | Vercel (React + Vite) | Free |
| Backend + AI | HF Spaces (FastAPI + CLIP ViT-B/32, Docker) | Free |
| Storage | Google Drive (via Apps Script) | Free |
| Logging | Google Sheets (via Apps Script) | Free |

No rate limits. Unlimited submissions.
