import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderAPI
      .myOrders()
      .then((response) => {
        setOrders(response.data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load your orders.');
        setLoading(false);
      });
  }, []);

  const STATUS_ORDER = { Pending: 0, Confirmed: 1, Shipped: 2, Delivered: 3, Cancelled: 4 };

  const sorted = [...orders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="page my-orders">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link> &gt; My Orders
      </nav>

      <h1>My Orders</h1>

      {loading ? (
        <Loading message="Loading your orders..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your placed orders will appear here."
          actionLabel="Shop Products"
          actionHref="/products"
        />
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date</th>
              <th className="numeric">Total</th>
              <th>Status</th>
              <th className="numeric">Items</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{formatDate(order.created_at)}</td>
                <td className="numeric">{formatINR(order.total_amount)}</td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td className="numeric">{order.item_count ?? '—'}</td>
                <td>
                  <Link to={`/my-orders/${order.id}`} className="btn btn-outline btn-sm">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
