import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { formatINR } from '../utils/format';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: '',
    is_active: true,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      productAPI
        .get(id)
        .then((response) => {
          const p = response.data.product;
          setForm({
            name: p.name,
            description: p.description,
            price: String(p.price ?? ''),
            image_url: p.image_url || '',
            category: p.category,
            stock: String(p.stock ?? ''),
            is_active: p.is_active === 1,
          });
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load product.');
          setLoading(false);
        });
    }
  }, [isEdit, id]);

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        image_url: form.image_url,
        category: form.category,
        stock: form.stock,
        is_active: form.is_active,
      };
      if (isEdit) {
        await productAPI.update(id, payload);
      } else {
        await productAPI.create(payload);
      }
      setSuccess('Product saved successfully.');
    } catch (err) {
      setError(err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.msg).join(' ')
        : err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page">Loading product...</div>;

  return (
    <div className="page admin-product-form">
      <nav className="breadcrumbs">
        <Link to="/admin">Admin</Link>{' > '}
        <Link to="/admin/products">Products</Link>{' > '}
        {isEdit ? 'Edit Product' : 'Add Product'}
      </nav>

      <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} noValidate className="product-form">
        <div className="form-field">
          <label htmlFor="name">Product name</label>
          <input id="name" type="text" value={form.name} onChange={handleChange('name')} required />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={4} value={form.description} onChange={handleChange('description')} />
        </div>
        <div className="form-field">
          <label htmlFor="price">Price (₹)</label>
          <input id="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange('price')} required />
        </div>
        <div className="form-field">
          <label htmlFor="image_url">Image URL</label>
          <input id="image_url" type="url" value={form.image_url} onChange={handleChange('image_url')} placeholder="https://..." />
          <p className="hint">Leave blank for a placeholder image.</p>
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <input id="category" type="text" value={form.category} onChange={handleChange('category')} required />
          <p className="hint">e.g. Groceries, Electronics, Home Essentials, Personal Care, Stationery</p>
        </div>
        <div className="form-field">
          <label htmlFor="stock">Stock quantity</label>
          <input id="stock" type="number" min="0" value={form.stock} onChange={handleChange('stock')} required />
        </div>
        <div className="form-field">
          <label>
            <input type="checkbox" checked={form.is_active} onChange={handleChange('is_active')} />
            Active (visible to customers)
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <Link to="/admin/products" className="btn btn-outline">Cancel</Link>
        </div>
        <p className="hint">
          Deactivating a product hides it from customers but preserves past order records.
        </p>
      </form>
    </div>
  );
}
