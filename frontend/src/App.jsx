import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import FeedbackReport from './pages/FeedbackReport';
import History from './pages/History';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  const { user } = useAuth();
  return (
    <div className="bg-animated min-h-screen relative">
      {user && <Navbar />}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/setup" element={<Protected><InterviewSetup /></Protected>} />
          <Route path="/interview/:sessionId" element={<Protected><InterviewSession /></Protected>} />
          <Route path="/report/:sessionId" element={<Protected><FeedbackReport /></Protected>} />
          <Route path="/history" element={<Protected><History /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
        </Routes>
      </div>
    </div>
  );
}