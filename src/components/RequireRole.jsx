import { Link } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';

export default function RequireRole({ roles, children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <section className="wrap narrow"><p>Loading...</p></section>;
  if (!user) {
    return (
      <section className="wrap narrow">
        <h1>Please log in</h1>
        <p>This page is for staff only.</p>
        <Link to="/login" className="btn gold">Log in</Link>
      </section>
    );
  }
  if (!roles.includes(role)) {
    return (
      <section className="wrap narrow">
        <h1>No access</h1>
        <p>Your account does not have permission to open this page.</p>
      </section>
    );
  }
  return children;
}