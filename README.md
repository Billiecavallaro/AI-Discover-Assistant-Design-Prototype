# GRaCe - AI Assistant Design

A beautiful, modern AI assistant chatbot interface built with React, TypeScript, Framer Motion, and Tailwind CSS.

## Features

- 🎨 **Beautiful UI** - Modern gradient design with glassmorphism effects
- 💬 **Interactive Chat** - Real-time messaging with AI responses
- 🎯 **Task Builder** - Build complex tasks using visual task categories
- 📎 **File Attachments** - Attach files and links to messages
- 🔔 **Reminders** - Set reminders from AI responses
- 🏆 **Gamification** - Achievements and efficiency metrics
- ✨ **Smooth Animations** - Powered by Framer Motion
- 📱 **Responsive** - Works on all screen sizes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Project Structure

```
├── src/
│   ├── ChatbotUI.tsx    # Main chatbot component
│   ├── App.tsx          # App component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts      # Vite config
└── tailwind.config.js  # Tailwind config
```

## Usage

The chatbot interface includes:

- **Quick Actions** - Pre-defined action buttons
- **Task Builder** - Select actions from categories (I WANT TO, USE MY, MAKE A)
- **Chat Interface** - Send messages and receive AI responses
- **Reminders** - Set reminders from assistant messages
- **Achievements** - Track your progress and unlock achievements
- **Metrics** - View your efficiency score, tasks completed, time saved, and streak

## Deployment to GitHub Pages

This project is configured to deploy to GitHub Pages.

### Prerequisites
- A GitHub account
- Git installed on your machine

### Deployment Steps

1. **Create a GitHub repository:**
   - Go to GitHub and create a new repository named `Discover-AI-Assistant-Design`
   - Do NOT initialize it with a README, .gitignore, or license

2. **Initialize Git and push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Discover-AI-Assistant-Design.git
   git push -u origin main
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "gh-pages" branch
   - Click "Save"

6. **Access your site:**
   - Your site will be available at: `https://YOUR_USERNAME.github.io/Discover-AI-Assistant-Design/`
   - It may take a few minutes for the site to be available after the first deployment

### Updating the Site

After making changes, simply run:
```bash
npm run deploy
```

This will rebuild and redeploy your site automatically.

## License

MIT

