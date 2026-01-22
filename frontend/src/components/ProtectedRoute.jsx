import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // User not authenticated
    return <Navigate to="/login" />;
  }

  return children;
}