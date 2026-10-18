import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { ProductGrid } from '../components/ProductGrid';
import { EmptyState } from '../components/EmptyState';
import Loading from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

const CATEGORIES = ['Groceries', 'Electronics', 'Home Essentials', 'Personal Care', 'Stationery'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productAPI
      .list({ limit: 8 })
      .then((response) => {
        setProducts(response.data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load featured products. Please try again later.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Local Store</h1>
          <p className="hero-tagline">
            Your neighborhood retail store for groceries, electronics, home essentials, personal care, and stationery.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-large">Shop Now</Link>
            <Link to="/cart" className="btn btn-outline btn-large">View Cart</Link>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-pills">
          {CATEGORIES.map((category) => (
            <a
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="category-pill"
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <h2 className="section-title">Featured Products</h2>
        {loading ? (
          <Loading message="Loading featured products..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : products.length === 0 ? (
          <EmptyState title="No featured products" description="Check back soon for new arrivals." />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>

      <section className="benefits-section">
        <div className="benefit">
          <strong>✓</strong> Fresh quality products
        </div>
        <div className="benefit">
          <strong>✓</strong> Fair prices for the community
        </div>
        <div className="benefit">
          <strong>✓</strong> Cash on delivery available
        </div>
        <div className="benefit">
          <strong>✓</strong> Secure ordering
        </div>
      </section>
    </div>
  );
}
