import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderAPI
      .get(id)
      .then((response) => {
        setOrder(response.data.order);
        setItems(response.data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Order not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Loading message="Loading order..." />;
  if (error || !order) return <ErrorMessage message={error || 'Order not found'} />;

  return (
    <div className="page order-detail">
      <nav className="breadcrumbs">
        <Link to="/my-orders">My Orders</Link> &gt; Order #{order.id}
      </nav>

      <h1>Order #{order.id}</h1>

      <div className="order-detail-grid">
        <div className="order-meta">
          <div className="meta-row">
            <strong>Order Number</strong>
            <span>#{order.id}</span>
          </div>
          <div className="meta-row">
            <strong>Date</strong>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="meta-row">
            <strong>Customer</strong>
            <span>{order.customer_name}</span>
          </div>
          <div className="meta-row">
            <strong>Phone</strong>
            <span>{order.phone}</span>
          </div>
          <div className="meta-row">
            <strong>Shipping Address</strong>
            <span>{order.shipping_address}</span>
          </div>
          <div className="meta-row">
            <strong>Payment Method</strong>
            <span>{order.payment_method}</span>
          </div>
          <div className="meta-row">
            <strong>Status</strong>
            <span className={`status-badge status-${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="order-items">
          <h2>Items</h2>
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="numeric">Unit Price</th>
                <th className="numeric">Qty</th>
                <th className="numeric">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td className="numeric">{formatINR(item.unit_price)}</td>
                  <td className="numeric">{item.quantity}</td>
                  <td className="numeric">{formatINR(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="order-grand-total">
            <span>Total</span>
            <span>{formatINR(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
