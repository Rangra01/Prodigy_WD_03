import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { orderAPI } from '../services/api';
import { formatINR } from '../utils/format';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      adminAPI.stats().then((r) => setStats(r.data)).catch(() => setError('Could not load statistics')),
      orderAPI.list().then((r) => setRecentOrders((r.data.orders || []).slice(0, 5))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page admin-dashboard">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link> &gt; Admin Dashboard
      </nav>

      <h1>Admin Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Active Products</span>
            <span className="stat-value">{stats.active_products}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{stats.total_products}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.total_orders}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{stats.pending_orders}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">{stats.total_customers}</span>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th className="numeric">Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td className="numeric">{formatINR(order.total_amount)}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="dashboard-actions">
          <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
          <Link to="/admin/orders" className="btn btn-outline">Manage Orders</Link>
        </div>
      </div>
    </div>
  );
}
