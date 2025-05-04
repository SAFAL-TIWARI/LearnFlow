# 📚 LearnFlow – Student Learning Portal

Welcome to **LearnFlow**, a responsive and dynamic web application designed to streamline access to academic learning resources for students, based on their **Year → Semester → Branch → Subject** flow.

---

## 🚀 Features

- 🔐 **Authentication System**
  - Google Sign-In
  - Protected access for learning resources

- 📁 **Smart Resource Filtering**
  - Dynamic subject display based on selected Year, Semester, and Branch
  - Learning materials (Assignments, Practicals, Lab Work, Syllabus) shown **only for selected subjects**

- 📌 **Navigation Buttons (Top & Footer)**
  - **About Us** – Shows platform info
  - **Tools** – Access a set of educational tools and utilities
  - **Resources** – Filter resources by Year → Sem → Branch → Subject
  - All footer buttons replicate top navbar functionality

- 🌙 **Dark/Light Mode Toggle**
  - Switch themes with a smooth toggle button

- 🎓 **Subject-Specific Learning Materials**
  - Organized per subject to avoid shared/common material confusion

- 🧠 **Branch-Specific Subjects**
  - Example: For `CSE (IoT)` → `1st Year → 2nd Sem`, subjects include:
    - CHB 101, ITC 101, CSL 110, MAB 102, HUB 101, CSA 103

---

## 🏗️ Project Structure

learnflow/
│
├── assets/ # Icons, logos, subject metadata
├── components/ # Reusable UI components (Navbar, Footer, SubjectCard, etc.)
├── pages/ # Main pages (Home, Resources, Tools, About Us)
├── data/ # JSON files with subject mappings and resources
├── public/ # Static assets
├── styles/ # CSS/SCSS styles
├── App.js # Main app component
└── README.md

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (React.js)
- **Authentication**: Firebase Auth (Google Sign-In)
- **Data Handling**: JSON & modular state management
- **Deployment**: [Vercel](https://learn-flow-seven.vercel.app/) 

---

## 🔧 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/learnflow.git
cd learnflow

# Install dependencies
npm install

# Run development server
npm start
📂 Sample Subject Mapping Structure

{
  "1st": {
    "2nd": {
      "CSE (IoT)": [
        "CHB 101", "ITC 101", "CSL 110", "MAB 102", "HUB 101", "CSA 103"
      ]
    }
  }
}

🔗 [View LearnFlow Live](https://learn-flow-seven.vercel.app/)

🤝 Contributors
👨‍💻 Safal Tiwari – Developer, Designer

📜 License
This project is licensed under the MIT License. See LICENSE file for details.

📩 Feedback
Have suggestions or want to contribute more features? Feel free to open an Issue or Pull Request.

---

Let me know if you'd like the `LICENSE` file or deployment badge (e.g., Vercel/Netlify) added too.
