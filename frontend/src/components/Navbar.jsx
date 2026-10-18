import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { Menu, ShoppingBag, User, X, Search } from 'lucide-react';

const BRAND = 'Local Store';

export default function Navbar() {
  const { user, logout, loading: authLoading } = useAuth();
  const { itemCount, refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🛍️</span>
          <span className="brand-name">{BRAND}</span>
        </Link>

        <div className="navbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            }}
            className="search-input"
          />
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="nav-icon-button" onClick={() => setMenuOpen(false)} title="Cart">
            <ShoppingBag size={20} />
            <span className="cart-count">{itemCount}</span>
          </Link>

          {user ? (
            <>
              <button onClick={handleLogout} className="nav-button" disabled={authLoading}>
                {authLoading ? 'Signing out...' : 'Sign out'}
              </button>
              <Link to="/my-orders" className="nav-button nav-button-secondary" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-button nav-button-secondary" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button nav-button-secondary" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="nav-button" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}

          <button className="nav-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
          {user ? (
            <>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>}
              <button onClick={handleLogout} className="mobile-signout">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
