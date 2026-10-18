import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      setSuccess('Account created! You are signed in.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.msg).join(' ')
        : err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join Local Store and shop with us.</p>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" value={form.name} onChange={handleChange('name')} required />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={form.email} onChange={handleChange('email')} required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={handleChange('password')} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-large" disabled={authLoading}>
            {authLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
