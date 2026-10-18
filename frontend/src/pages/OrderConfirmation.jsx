import { useLocation, Link } from 'react-router-dom';
import { formatINR, formatDate } from '../utils/format';

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="page">
        <h1>Order Confirmation</h1>
        <p>No order information found.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="page order-confirmation">
      <div className="confirmation-card">
        <h1>Order Placed Successfully</h1>
        <p>Thank you for shopping with Local Store!</p>
        <div className="order-details">
          <div className="detail-row">
            <strong>Order Number</strong>
            <span>#{order.id}</span>
          </div>
          <div className="detail-row">
            <strong>Date</strong>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="detail-row">
            <strong>Customer</strong>
            <span>{order.customer_name}</span>
          </div>
          <div className="detail-row">
            <strong>Payment Method</strong>
            <span>Cash on Delivery</span>
          </div>
          <div className="detail-row">
            <strong>Status</strong>
            <span>Pending</span>
          </div>
          <div className="detail-row">
            <strong>Total</strong>
            <span>{formatINR(order.total_amount)}</span>
          </div>
        </div>
        <p className="hint">We will deliver to your shipping address. Pay in cash on delivery.</p>
        <div className="confirmation-actions">
          <Link to="/my-orders" className="btn btn-primary">View My Orders</Link>
          <Link to="/" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
