# 📚 LearnFlow – Student Learning Portal

Welcome to **LearnFlow**, a responsive and dynamic web application designed to streamline access to academic learning resources for students, based on their **Year → Semester → Branch → Subject** flow.

## 🚀 Features

- 🔐 **Authentication System**: Google Sign-In with protected access for learning resources
- 📁 **Smart Resource Filtering**: Dynamic subject display based on Year, Semester, and Branch
- 🌙 **Dark/Light Mode Toggle**: Switch themes with a smooth toggle button
- 🎓 **Subject-Specific Learning Materials**: Organized per subject to avoid confusion
- 🧠 **Branch-Specific Subjects**: Tailored subject lists for each branch and semester
- 🤖 **AI Chatbot**: Intelligent educational assistant powered by Google's Gemini API

## 🏗️ Project Structure

```
learnflow/
│
├── components/            # UI components (Navbar, Footer, etc.)
│   └── Chatbot/           # Chatbot components with dedicated README
├── pages/                 # Main pages (Home, Resources, Tools)
├── data/                  # JSON files with subject mappings
├── server/                # Backend server for chatbot
├── styles/                # CSS/SCSS styles
└── public/                # Static assets
```

## 🛠️ Tech Stack

- **Frontend**: React.js, HTML5, CSS3, JavaScript
- **Authentication**: Firebase Auth (Google Sign-In)
- **AI Chatbot**: Google's Gemini API
- **Backend**: Node.js, Express
- **Deployment**: Vercel

## 🔧 Setup and Installation

### Prerequisites
- Node.js 14+ and npm/yarn

### Quick Start
1. Clone and install dependencies:
```bash
git clone https://github.com/your-username/learnflow.git
cd learnflow
npm install
cd server && npm install && cd ..
```

2. Set up environment variables:
   - Create `.env` files in root and server directories

3. Start the application:
   - Use `start-all.bat` or run `npm start`

## 📂 Subject Mapping Example

```json
{
  "1st": {
    "2nd": {
      "CSE (IoT)": [
        "CHB 101", "ITC 101", "CSL 110", "MAB 102", "HUB 101", "CSA 103"
      ]
    }
  }
}
```

## 🚀 Deployment

- **Frontend**: Build with `npm run build` and deploy to Vercel
- **Chatbot Server**: Deploy to Railway.com or any Node.js hosting service

## 🔗 Links & Contributors

- [View LearnFlow Live](https://learn-flow-seven.vercel.app/)
- 👨‍💻 **Safal Tiwari** – Developer, Designer

## 📜 License & Feedback

This project is licensed under the MIT License. For feedback or contributions, please open an Issue or Pull Request.

---

**Note**: For detailed information about the chatbot, see the README in the `src/components/Chatbot` directory.
