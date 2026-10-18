import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { orderAPI } from '../services/api';
import { formatINR } from '../utils/format';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, itemCount, clear, refresh } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: user ? user.name : '',
    phone: '',
    shipping_address: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    if (itemCount === 0) navigate('/cart');
  }, [itemCount, navigate]);

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setCheckoutError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    setSubmitting(true);
    try {
      const response = await orderAPI.create(form);
      await clear();
      await refresh();
      navigate('/order-confirmation', { state: { order: response.data.order } });
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading cart..." />;

  return (
    <div className="page checkout-page">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link> &gt; <Link to="/cart">Cart</Link> &gt; Checkout
      </nav>

      {itemCount === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add items to your cart before checking out."
          actionLabel="Shop Products"
          actionHref="/products"
        />
      ) : (
        <>
          <h1>Place Your Order</h1>

          <div className="checkout-layout">
            <div className="checkout-form-section">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="customer_name">Full name</label>
                  <input
                    id="customer_name"
                    type="text"
                    value={form.customer_name}
                    onChange={handleChange('customer_name')}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="shipping_address">Shipping address</label>
                  <textarea
                    id="shipping_address"
                    rows={4}
                    value={form.shipping_address}
                    onChange={handleChange('shipping_address')}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>
                    <input type="radio" name="payment_method" value="COD" defaultChecked /> Cash on Delivery
                  </label>
                  <p className="hint">Pay in cash when your order is delivered.</p>
                </div>
                {checkoutError && <div className="error-message">{checkoutError}</div>}
                <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                  {submitting ? 'Placing order...' : 'Place Order'}
                </button>
              </form>
            </div>

            <div className="checkout-summary">
              <h2>Order Summary</h2>
              <table className="summary-table">
                <thead>
                  <tr><th>Item</th><th className="numeric">Qty</th><th className="numeric">Total</th></tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.cart_item_id || item.product_id}>
                      <td>{item.name}</td>
                      <td className="numeric">{item.quantity}</td>
                      <td className="numeric">{formatINR(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="summary-totals">
                <div className="summary-total-row">
                  <span>Grand Total</span>
                  <span>{formatINR(total)}</span>
                </div>
                <p className="hint">Totals are calculated by the server from current product prices.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
