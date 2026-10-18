import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmDialog } from '../components/ConfirmDialog';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    orderAPI
      .list()
      .then((response) => {
        setOrders(response.data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load orders.');
        setLoading(false);
      });
  }, []);

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleStatusChange = (orderId, currentStatus, newStatus) => {
    if (newStatus === currentStatus) return;
    setConfirm({
      orderId,
      currentStatus,
      newStatus,
      title: 'Update Order Status',
      message: `Change order #${orderId} from ${currentStatus} to ${newStatus}? Stock is restored automatically when cancelling Pending or Confirmed orders.`,
    });
  };

  const handleConfirmStatus = async () => {
    if (!confirm) return;
    try {
      await orderAPI.updateStatus(confirm.orderId, confirm.newStatus);
      setOrders(orders.map((o) => (o.id === confirm.orderId ? { ...o, status: confirm.newStatus } : o)));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setConfirm(null);
    }
  };

  if (loading) return <Loading message="Loading orders..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page admin-orders">
      <nav className="breadcrumbs">
        <Link to="/admin">Admin</Link> &gt; Orders
      </nav>

      <h1>Order Management</h1>

      <div className="filter-group">
        <label htmlFor="statusFilter">Filter by status</label>
        <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th className="numeric">Total</th>
              <th>Status</th>
              <th>Date</th>
              <th className="numeric">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer_name}</td>
                <td className="numeric">{formatINR(order.total_amount)}</td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{formatDate(order.created_at)}</td>
                <td className="numeric">
                  <Link to={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">View</Link>{' '}
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                    className="status-select"
                  >
                    {STATUSES.map((s) => {
                      const allowed =
                        (order.status === 'Pending' && ['Confirmed', 'Cancelled'].includes(s)) ||
                        (order.status === 'Confirmed' && ['Shipped', 'Cancelled'].includes(s)) ||
                        (order.status === 'Shipped' && s === 'Delivered');
                      return allowed && s !== order.status ? (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ) : null;
                    })}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Update Status"
        cancelLabel="Cancel"
        onConfirm={handleConfirmStatus}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
