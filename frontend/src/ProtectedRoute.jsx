import { Navigate } from 'react-router-dom';

function ProtectedRoute({ jwtToken, children }) {
  if (!jwtToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
