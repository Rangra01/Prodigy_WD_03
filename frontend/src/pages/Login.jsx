import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2>Sign in</h2>
        <p>Welcome back to Local Store.</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={form.email} onChange={handleChange('email')} required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={handleChange('password')} required />
          </div>
          <button type="submit" className="btn btn-primary btn-large" disabled={authLoading}>
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </p>
        <p className="auth-switch">
          Shopping as a guest? Continue to{' '}
          <Link to={from === '/login' ? '/' : from}>browse products</Link>.
        </p>
      </div>
    </div>
  );
}
