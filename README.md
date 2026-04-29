<<<<<<< HEAD
# Neural-Hire
AI-powered interview practice platform built with React, Vite, Tailwind CSS, GSAP, React Three Fiber, and OpenAI for realistic mock interviews and instant feedback
=======
# AI Interview Simulator

A comprehensive full-stack platform designed to help users prepare for technical and behavioral interviews using Artificial Intelligence. This platform features a modern, immersive 3D user interface and powerful backend services to simulate real-world interview scenarios, evaluate performance, and provide constructive feedback.

## Features

- **Immersive 3D UI**: Built with React Three Fiber, featuring interactive 3D elements (like a rotating brain/icosahedron mesh) for a modern, engaging experience.
- **Smooth Animations**: Powered by GSAP and Framer Motion for seamless page transitions, scroll-triggered animations, and polished micro-interactions.
- **AI-Powered Interviews**: Integration with OpenAI's API to generate dynamic interview questions and assess user responses in real-time.
- **Secure Authentication**: User authentication and authorization handled with JSON Web Tokens (JWT) and bcryptjs for secure password hashing.
- **Performance Analytics**: Visual feedback on interview performance utilizing Recharts to render insightful data.
- **Responsive Design**: Tailored layout aesthetics using TailwindCSS, complete with a dark navy/purple custom CSS-animated gradient mesh background.

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS, PostCSS
- **3D & Graphics**: Three.js, React Three Fiber (@react-three/fiber, @react-three/drei)
- **Animations**: GSAP, Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI Integration**: OpenAI API
- **Security**: bcryptjs (hashing), jsonwebtoken (JWT), cors, express-rate-limit

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)
- OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-interview-simulator.git
   cd ai-interview-simulator
   ```

2. **Setup the Backend:**
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `backend` directory and add your variables:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     OPENAI_API_KEY=your_openai_api_key
     ```
   - Start the backend server (development mode):
     ```bash
     npm run dev
     ```

3. **Setup the Frontend:**
   - Open a new terminal and navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

## Project Structure

```
ai-interview-simulator/
├── backend/                  # Express.js server and API
│   ├── middleware/           # Custom Express middleware (auth, etc.)
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic and external API integrations
│   ├── utils/                # Utility functions
│   ├── server.js             # Entry point for the backend
│   └── package.json
├── frontend/                 # React frontend application
│   ├── src/                  # React components, pages, hooks, and context
│   ├── index.html            # Entry HTML file
│   ├── tailwind.config.js    # TailwindCSS configuration
│   ├── vite.config.js        # Vite configuration
│   └── package.json
└── README.md                 # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
>>>>>>> cacfb59 (Initial commit: AI Interview Simulator project setup)
