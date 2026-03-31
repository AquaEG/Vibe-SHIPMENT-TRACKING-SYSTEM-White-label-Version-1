import { Navigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';

export function RequireAdminAccess({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useAppData();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
