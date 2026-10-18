import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { formatINR } from '../utils/format';
import { ShoppingBag, Plus } from 'lucide-react';

const PLACEHOLDER =
  'https://placehold.co/400x400/e2e8f0/475569?text=Image';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { add, loading } = useCart();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setAdding(true);
    try {
      await add(product.id, 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = Number(product.stock) <= 0 || product.is_active !== 1;

  return (
    <article className="product-card">
      <div className="product-card-image">
        <img
          src={product.image_url || PLACEHOLDER}
          alt={product.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />
        {isOutOfStock && <span className="out-of-stock-badge">Out of Stock</span>}
      </div>
      <div className="product-card-content">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">{formatINR(product.price)}</div>
        <p className="product-stock">
          {isOutOfStock ? 'Out of stock' : `In stock: ${product.stock} available`}
        </p>
        <div className="product-card-actions">
          <Link to={`/products/${product.id}`} className="btn btn-outline btn-sm">
            View Details
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {error && <div className="product-card-error">{error}</div>}
      </div>
    </article>
  );
}
