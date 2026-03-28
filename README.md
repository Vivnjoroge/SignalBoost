<div align="center">
<img width="1200" height="475" alt="StorySasa Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SignalBoost (StorySasa)

**SignalBoost** (branded as **StorySasa**) is a verified citizen journalism platform designed to amplify underreported community stories. By leveraging AI to surface critical issues, the platform prioritizes impact over trends, ensuring that essential community signals are heard by institutions and the public.

## 🚀 Key Features

- **Story Feed**: A dynamic feed of community-submitted "signals" (stories) with real-time amplification and category filtering.
- **AI-Powered Insights**: Uses Gemini AI to automatically categorize stories, calculate impact scores, and provide summaries.
- **Impact Map**: A geolocation-based visualization of reported issues, helping institutions identify geographic clusters of concern.
- **Verification Lab**: A dedicated interface for institutional users to verify and manage the status of community reports.
- **Multifaceted Dashboards**:
  - **Reporter Dashboard**: For community members to track their submissions and impact.
  - **Institutional Hub**: For organizations to manage signals, verify facts, and respond to community needs.
- **Smart Chatbot**: An AI assistant to help users navigate the platform and find relevant stories.

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **AI Engine**: [Google Generative AI (Gemini)](https://ai.google.dev/)

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- Firebase Project setup
- Google AI Studio (Gemini) API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd SignalBoost
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file (or rename `.env.example`) and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Set up Firebase:
   Ensure your Firebase configuration is correctly set in `src/firebase.ts`.

### Running Locally

To start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📁 Project Structure

- `src/components/`: Reusable UI components (Modals, Dashboards, StoryCards).
- `src/services/`: AI and external service logic.
- `src/firebase.ts`: Firebase initialization and configuration.
- `src/types.ts`: TypeScript interfaces and types.
- `firestore.rules`: Security rules for the database.

---
*Built with passion for community-driven journalism.*
