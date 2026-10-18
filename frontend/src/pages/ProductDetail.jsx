import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { productAPI } from '../services/api';
import { formatINR } from '../utils/format';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';

const PLACEHOLDER = 'https://placehold.co/600x600/e2e8f0/475569?text=Image';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addError, setAddError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    productAPI
      .get(id)
      .then((response) => {
        setProduct(response.data.product);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Product not found');
        setLoading(false);
      });
  }, [id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError(null);
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await add(Number(id), quantity);
    } catch (err) {
      setAddError(err.response?.data?.error || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loading message="Loading product..." />;
  if (error || !product) return <ErrorMessage message={error || 'Product not found'} />;

  const isOutOfStock = Number(product.stock) <= 0 || product.is_active !== 1;

  return (
    <div className="page product-detail">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link> &gt; <Link to="/products">Products</Link> &gt; {product.name}
      </nav>

      <div className="product-detail-grid">
        <div className="product-detail-image">
          <img
            src={product.image_url || PLACEHOLDER}
            alt={product.name}
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <p className="product-detail-stock">
            {isOutOfStock ? 'Out of stock' : `In stock: ${product.stock} available`}
          </p>
        </div>

        <div className="product-detail-info">
          <span className="product-detail-category">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-detail-price">{formatINR(product.price)}</div>
          <p className="product-detail-description">{product.description || 'No description available.'}</p>

          <form onSubmit={handleAdd} className="product-detail-form">
            <div className="form-field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                disabled={isOutOfStock || adding}
              />
            </div>
            {addError && <div className="error-message">{addError}</div>}
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={isOutOfStock || adding}
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </form>
          <p className="hint">
            Sign in to add items to your cart. Orders are placed with Cash on Delivery.
          </p>
        </div>
      </div>

      <div className="back-link">
        <Link to="/products">← Back to products</Link>
      </div>
    </div>
  );
}
