# PathFinder AI 🧭

PathFinder AI (also known as SkillCompass or NextStep AI) is a fully-integrated AI-powered career counselor designed for students, freshers, and career switchers. It takes your current skills, experience levels, and working preferences, analyzes them using Google Gemini 2.0 Flash, and returns custom matching roles, skill gap analyses, interactive checklist roadmaps, and contextual chat mentorship.

---

## 🚀 Key Features

1.  **Skills Wizard Form**: Tap-to-select common skills, add custom tags, select your experience level, and set core work style/setup preferences.
2.  **Match Dashboard**: View 3-5 ranked careers, each with an AI confidence index, custom fit explanation, estimated salary ranges (INR focus), and industry demand meters.
3.  **Visual Skill Gap (Radar Chart)**: A side-by-side comparison of "Your Current Profile" vs "Required Role Target" mapping your strengths and gaps.
4.  **Interactive Month-by-Month Roadmap**: Clear checklist milestones for learning and project builds that update completion percentages as you check them off. Progress is saved locally.
5.  **Comparison Mode**: Check two cards to review their matches, salaries, fit reasoning, and skill differences side-by-side.
6.  **AI Career Coach Chat**: Send follow-up questions (e.g. "What if I don't want to code?" or "Which certs should I buy?") and get conversational answers from a Gemini agent aware of your context.
7.  **Client-Side PDF Export**: Download your completed learning roadmap as a dark-themed PDF report with a single tap.
8.  **Try a Demo Profile**: Skip form entry and test the dashboard and radar charts instantly using static local mock profiles.

---

## 🛠️ Tech Stack

-   **Frontend**: React (Vite) + TailwindCSS + Recharts (Radar Chart) + Framer Motion (staggered entries, page transitions) + Lucide Icons.
-   **Client Exports**: `jsPDF` + `html2canvas` for direct report rendering.
-   **Backend**: Node.js + Express serving the API and built assets.
-   **AI Integration**: Google Gemini API (`gemini-2.0-flash` model using JSON mode).

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Install Dependencies
Clone/download the repository, open the terminal in the root directory, and run:
```bash
npm install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env

---

## 💻 Running the Application

### Development Mode (Runs Frontend + Backend Concurrently)
To run both the Vite development server (port 5173) and the Express backend (port 3001) in parallel, execute:
```bash
npm run dev
```
-   Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

### Production Build & Launch
To compile the frontend assets and run the Express server serving the static files from the same port, execute:
```bash
# 1. Compile frontend bundles
npm run build

# 2. Start the Express server
npm run start
```
-   Open your browser and navigate to: [http://localhost:3001](http://localhost:3001)
