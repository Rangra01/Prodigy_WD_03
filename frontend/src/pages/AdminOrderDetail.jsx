import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmDialog } from '../components/ConfirmDialog';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(order ? order.status : '');

  useEffect(() => {
    orderAPI
      .get(id)
      .then((response) => {
        setOrder(response.data.order);
        setItems(response.data.items || []);
        setPendingStatus(response.data.order.status);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Order not found');
        setLoading(false);
      });
  }, [id]);

  const handleStatusChange = (newStatus) => {
    setPendingStatus(newStatus);
    if (!order || newStatus === order.status) return;
    setConfirm({
      newStatus,
      title: 'Update Order Status',
      message: `Change order #${order.id} from ${order.status} to ${newStatus}?`,
    });
  };

  const handleConfirmStatus = async () => {
    if (!confirm || !order) return;
    try {
      await orderAPI.updateStatus(order.id, pendingStatus);
      setOrder((prev) => (prev ? { ...prev, status: pendingStatus } : null));
      setPendingStatus(pendingStatus);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setConfirm(null);
    }
  };

  if (loading) return <Loading message="Loading order..." />;
  if (error || !order) return <ErrorMessage message={error || 'Order not found'} />;

  const allowedNext = (order.status === 'Pending' && ['Confirmed', 'Cancelled']) ||
    (order.status === 'Confirmed' && ['Shipped', 'Cancelled']) ||
    (order.status === 'Shipped' && ['Delivered'])
    ? STATUSES.filter(
        (s) =>
          s !== order.status &&
          ((order.status === 'Pending' && ['Confirmed', 'Cancelled'].includes(s)) ||
            (order.status === 'Confirmed' && ['Shipped', 'Cancelled'].includes(s)) ||
            (order.status === 'Shipped' && s === 'Delivered'))
      )
    : [];

  return (
    <div className="page admin-order-detail">
      <nav className="breadcrumbs">
        <Link to="/admin/orders">Orders</Link> &gt; Order #{order.id}
      </nav>

      <h1>Order #{order.id}</h1>

      <div className="order-detail-grid">
        <div className="order-meta">
          <div className="meta-row"><strong>Order Number</strong><span>#{order.id}</span></div>
          <div className="meta-row"><strong>Date</strong><span>{formatDate(order.created_at)}</span></div>
          <div className="meta-row"><strong>Customer</strong><span>{order.customer_name}</span></div>
          <div className="meta-row"><strong>Email</strong><span>{order.customer_email}</span></div>
          <div className="meta-row"><strong>Phone</strong><span>{order.phone}</span></div>
          <div className="meta-row"><strong>Shipping Address</strong><span>{order.shipping_address}</span></div>
          <div className="meta-row"><strong>Payment Method</strong><span>{order.payment_method}</span></div>
          <div className="meta-row">
            <strong>Status</strong>
            <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
        </div>

        <div className="order-actions">
          {allowedNext.length > 0 ? (
            <>
              <select value={pendingStatus} onChange={(e) => handleStatusChange(e.target.value)} className="status-select">
                <option value={order.status}>{order.status} (current)</option>
                {allowedNext.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={() => handleConfirmStatus()} disabled={!!confirm || pendingStatus === order.status}>
                {confirm ? 'Updating...' : 'Update Status'}
              </button>
            </>
          ) : (
            <p>No further status transitions are allowed for this order.</p>
          )}
          <Link to="/admin/orders" className="btn btn-outline">Back to orders</Link>
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
