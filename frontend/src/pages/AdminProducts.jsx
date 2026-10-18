import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { formatINR } from '../utils/format';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    productAPI
      .list({ show_all: 1, limit: 100 })
      .then((response) => {
        setProducts(response.data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load products.');
        setLoading(false);
      });
  }, []);

  const handleDeactivate = (id) => {
    setConfirm({ id, title: 'Deactivate product', message: 'This product will be hidden from customers. Past orders will keep their history.' });
  };

  const handleConfirmDeactivate = async () => {
    if (!confirm) return;
    try {
      await productAPI.remove(confirm.id);
      setProducts(products.filter((p) => p.id !== confirm.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to deactivate product');
    } finally {
      setConfirm(null);
    }
  };

  if (loading) return <Loading message="Loading products..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page admin-products">
      <nav className="breadcrumbs">
        <Link to="/admin">Admin</Link> &gt; Products
      </nav>

      <div className="page-header">
        <h1>Product Management</h1>
        <Link to="/admin/products/add" className="btn btn-primary">Add Product</Link>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th className="numeric">Price</th>
              <th className="numeric">Stock</th>
              <th>Status</th>
              <th className="numeric">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>#{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td className="numeric">{formatINR(product.price)}</td>
                <td className="numeric">{product.stock}</td>
                <td>
                  <span className={`status-badge status-${product.is_active ? 'active' : 'inactive'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="numeric">
                  <Link to={`/admin/products/${product.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>{' '}
                  <button className="btn btn-outline btn-sm danger" onClick={() => handleDeactivate(product.id)}>
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </button>
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
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
