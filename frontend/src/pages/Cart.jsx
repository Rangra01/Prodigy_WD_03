import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { cartAPI } from '../services/api';
import { formatINR } from '../utils/format';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';

export default function Cart() {
  const { user } = useAuth();
  const { items, itemCount, total, loading, remove, clear, refresh } = useCart();
  const navigate = useNavigate();

  const [updateLoading, setUpdateLoading] = useState(new Set());

  const handleQuantityChange = async (cartItemId, productId, newQty) => {
    if (newQty < 1) return;
    setUpdateLoading((prev) => new Set([...prev, cartItemId]));
    try {
      await cartAPI.update(productId, newQty);
      await refresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update quantity');
    } finally {
      setUpdateLoading((prev) => new Set([...prev].filter((id) => id !== cartItemId)));
    }
  };

  const handleRemove = async (cartItemId, productId) => {
    try {
      await cartAPI.remove(productId);
      await refresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove item');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      await clear();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear cart');
    }
  };

  if (loading) return <Loading message="Loading cart..." />;

  return (
    <div className="page cart-page">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link> &gt; Cart
      </nav>

      <h1>Shopping Cart</h1>

      {!user && (
        <div className="info-box">
          Sign in to save your cart across devices. You can continue as a guest and log in at checkout.
        </div>
      )}

      {itemCount === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart to get started."
          actionLabel="Shop Products"
          actionHref="/products"
        />
      ) : (
        <>
          <div className="cart-table-wrapper">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="numeric">Unit Price</th>
                  <th className="numeric">Quantity</th>
                  <th className="numeric">Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.cart_item_id}>
                    <td className="cart-item-cell">
                      <div className="cart-item-image">
                        <img src={item.image_url || 'https://placehold.co/80x80/e2e8f0/475569?text=Img'} alt={item.name} />
                      </div>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-category">{item.category}</div>
                        {!item.enough_stock && (
                          <div className="cart-item-warning">Only {item.stock} left in stock</div>
                        )}
                        {!item.available && <div className="cart-item-warning">Unavailable</div>}
                      </div>
                    </td>
                    <td className="numeric">{formatINR(item.unit_price)}</td>
                    <td className="numeric">
                      <div className="quantity-control">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleQuantityChange(item.cart_item_id, item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateLoading.has(item.cart_item_id)}
                        >
                          −
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleQuantityChange(item.cart_item_id, item.product_id, item.quantity + 1)}
                          disabled={!item.enough_stock || updateLoading.has(item.cart_item_id)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="numeric">{formatINR(item.line_total)}</td>
                    <td>
                      <button className="btn btn-outline btn-sm danger" onClick={() => handleRemove(item.cart_item_id, item.product_id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Items ({itemCount})</span>
              <span>{formatINR(total)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Grand Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <div className="summary-actions">
              <button className="btn btn-outline" onClick={handleClear} disabled={loading}>
                Clear Cart
              </button>
              <Link to="/checkout" className="btn btn-primary btn-large">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
