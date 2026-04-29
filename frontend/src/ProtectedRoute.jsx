import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component - ensures only authenticated users can access routes
 * Redirects to /login if no JWT token is found
 */
function ProtectedRoute({ jwtToken, children }) {
  if (!jwtToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
