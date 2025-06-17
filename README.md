# 📚 LearnFlow – Student Learning Portal

Welcome to **LearnFlow**, a responsive and dynamic web application designed to streamline access to academic learning resources for students, based on their **Year → Semester → Branch → Subject** flow.

## 🚀 Features

- 🔐 **Authentication System**: Google Sign-In with protected access for learning resources
- 📁 **Smart Resource Filtering**: Dynamic subject display based on Year, Semester, and Branch
- 🌙 **Dark/Light Mode Toggle**: Switch themes with a smooth toggle button
- 🎓 **Subject-Specific Learning Materials**: Organized per subject to avoid confusion
- 🧠 **Branch-Specific Subjects**: Tailored subject lists for each branch and semester
- 🤖 **AI Chatbot**: Intelligent educational assistant powered by Google's Gemini API
- 🖱️ **Smooth Cursor Animation**: Interactive cursor with spring physics for enhanced user experience

## 🏗️ Project Structure

```
LearnFlow/
│
├── src/                   # Source code directory
│   ├── components/        # UI components (Navbar, Footer, etc.)
│   │   └── Chatbot/       # Chatbot components with dedicated README
│   ├── pages/             # Main pages (Home, Resources, Tools)
│   ├── data/              # JSON files with subject mappings
│   ├── styles/            # CSS/SCSS styles
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   ├── lib/               # Utility libraries and configurations
│   ├── services/          # API services and integrations
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Backend server for chatbot
│   ├── api/               # API endpoints
│   ├── services/          # Server-side services
│   └── utils/             # Server utilities
├── public/                # Static assets
├── scripts/               # Build and deployment scripts
└── .github/               # GitHub workflows and configurations
```

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Authentication**: Supabase Auth (Google Sign-In And Email Login)
- **AI Chatbot**: Google's Gemini API
- **Backend**: Node.js, Express
- **Animations**: Framer Motion, GSAP
- **Analytics**: Vercel Analytics, Google Analytics
- **Deployment**: Vercel, Netlify, GitHub Pages

## 🔧 Setup and Installation

### Prerequisites
- Node.js 16+ and npm/yarn

### Quick Start
1. Clone and install dependencies:
```bash
git clone https://github.com/your-username/learnflow.git
cd LearnFlow
npm install
cd server && npm install && cd ..
```

2. Set up environment variables:
   - Create `.env` files in root and server directories
   - See `.env.example` for required variables

3. Start the application:
   - Development: `npm run dev` or use `start-all.bat`
   - Production build: `npm run build`
   - Start with server: `npm start`

## 📂 Subject Mapping Example

```json
{
  "1st": {
    "1st": {
      "CSE": [
        "CHB 101", "CSA 101", "CSA 102", "MAB 101", "HUB 101"
      ]
    }
  }
}
```

## 🚀 Deployment

- **Frontend**: 
  - Vercel: `npm run vercel-build` or use `npm run build`
  - Netlify: `npm run build:netlify`
  - GitHub Pages: `npm run build:github`
  - Static hosting: `npm run build:static`
- **Chatbot Server**: Deploy to Railway.com or any Node.js hosting service

## 🔗 Links & Contributors

- [View LearnFlow Live](https://learn-flow-seven.vercel.app/)
- 👨‍💻 **Safal Tiwari** – Developer, Designer

## 📜 License & Feedback

This project is licensed under the MIT License. For feedback or contributions, please open an Issue or Pull Request.

---

**Note**: For detailed information about the chatbot, see the README in the `src/components/Chatbot` directory.
