<div align="center">

# 🌐 SocialHub

**Unified Social Media Command Center**  
*Manage, Schedule, Publish & Track TikTok & Instagram from One Single Dashboard*

[![Live Demo](https://img.shields.io/badge/Demo-socialhub--wine.vercel.app-blue?style=for-the-badge&logo=vercel)](https://socialhub-wine.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[**Explore Live App »**](https://socialhub-wine.vercel.app) · [Report Bug](https://github.com/bwx330-dev/socialhub/issues) · [Request Feature](https://github.com/bwx330-dev/socialhub/issues)

</div>

---

## ✨ Features

- 📊 **Real-time Analytics Dashboard**  
  Aggregated cross-platform analytics for both TikTok and Instagram. Track follower growth, engagement rates, impressions, and weekly performance trends with interactive charts.

- ✍️ **Unified Content Composer & Live Mobile Mockup**  
  Write captions, generate hashtags, attach media, and inspect realistic real-time previews of how your post looks on **TikTok Feed** and **Instagram Feed** before publishing.

- 📅 **Smart Post Scheduler & Calendar**  
  Schedule posts ahead of time with prime-time indicators (18:00 – 21:00 WIB), drag-and-drop calendar overview, and automated queue execution.

- 💡 **AI Hook & Caption Studio**  
  Generate high-retention viral 3-second hooks, structured TikTok video scripts (Hook, Retain, Payoff, CTA), and engaging Instagram captions with 1-click transfer to post composer.

- 🏷️ **Hashtag & Tren Explorer**  
  Smart 3-Tier hashtag balancing (High, Medium, Niche volume), shadowban keyword scanner, pre-curated Indonesian niche library, and custom saved hashtag sets.

- 🔗 **Smart Link-in-Bio Builder**  
  Create personalized Linktree-style bio link pages with live interactive smartphone mockup, customizable themes (Obsidian, Neon, Sunset, Emerald), and public shareable URLs.

- 💰 **Inspirasi Konten & Rate Card Simulator**  
  Live sponsorship & endorsement pricing calculator based on real TikTok follower & engagement metrics, 30-day content ideation matrix, and 2026 FYP algorithm breakdown.

- 🔗 **Official Multi-Platform API Integration**  
  - **TikTok Developer API**: Official OAuth 2.0 Login Kit & Content Posting API integration.
  - **Instagram Graph API**: Direct Meta Developer platform support with quick-connect capability.
  - Automatic detection and status badges (`✓ Akun Sudah Terhubung`) when accounts are linked.

- 🔐 **Persistent Device Sessions & Auto-Login**  
  Seamless session handling with 30-day persistent authentication across devices — no repetitive logins required when opening the dashboard.

- 🔔 **Interactive Notification Center**  
  Integrated bell notification tray providing real-time alerts on account connectivity, scheduled post reminders, and daily optimal posting times.

- ☁️ **Cloud Database Synchronization**  
  Powered by Supabase PostgreSQL for high-speed, persistent account and content storage with zero monthly recurring cost.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Route Handlers) |
| **Frontend** | [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev) |
| **Database & Auth** | [Supabase](https://supabase.com) (PostgreSQL) |
| **Social APIs** | TikTok Open API (Login Kit v2), Meta Instagram Graph API |
| **Deployment** | [Vercel](https://vercel.com) (Edge Serverless) |

---

## 🚀 Live Demo

You can try the production build immediately:  
🔗 **[https://socialhub-wine.vercel.app](https://socialhub-wine.vercel.app)**  
*(Alternative mirror: [https://socialhub-bxvv0.vercel.app](https://socialhub-bxvv0.vercel.app))*

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.17 or higher
- [npm](https://www.npmjs.com/) or `pnpm`
- A free [Supabase](https://supabase.com) project
- (Optional) TikTok Developer Account & Meta Developer Account

### 1. Clone Repository

```bash
git clone https://github.com/bwx330-dev/socialhub.git
cd socialhub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Cloud Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# TikTok Developer API
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=https://your-domain.vercel.app/api/tiktok/callback

# Public URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 🗄️ Database Architecture

The application connects to Supabase with the following schema:

```sql
-- Connected Social Media Accounts
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  access_token TEXT,
  refresh_token TEXT,
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scheduled & Published Posts
CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  platform TEXT NOT NULL,
  caption TEXT NOT NULL,
  media_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔒 Security & Privacy

- All sensitive tokens and secrets are stored server-side and protected by environment variables.
- Direct OAuth 2.0 flows follow PKCE and standard state parameter validation to protect against CSRF attacks.
- Zero tracking of personal user credentials outside granted developer scopes.

---

## 👤 Author

**bwx330-dev**
- GitHub: [@bwx330-dev](https://github.com/bwx330-dev)
- Website: [socialhub-wine.vercel.app](https://socialhub-wine.vercel.app)

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
