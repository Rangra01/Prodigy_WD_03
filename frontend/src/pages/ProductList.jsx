import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { ProductGrid } from '../components/ProductGrid';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Pagination } from '../components/Pagination';

const CATEGORIES = ['Groceries', 'Electronics', 'Home Essentials', 'Personal Care', 'Stationery'];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchProducts = useCallback(() => {
    const params = {
      page,
      limit: 12,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sort: searchParams.get('sort') || 'asc',
    };
    setLoading(true);
    productAPI
      .list(params)
      .then((response) => {
        setProducts(response.data.products || []);
        setTotal(response.data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load products. Please try again later.');
        setLoading(false);
      });
  }, [page, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    productAPI
      .list({ limit: 1 })
      .then((response) => {
        const catSet = new Set((response.data.products || []).map((p) => p.category));
        setCategories(Array.from(catSet).length > 0 ? Array.from(catSet) : CATEGORIES);
      })
      .catch(() => setCategories(CATEGORIES));
  }, []);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="page product-list">
      <div className="page-header">
        <h1>Products</h1>
        <p>{total} item{total !== 1 ? 's' : ''} found</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name"
            value={searchParams.get('search') || ''}
            onChange={(e) => updateQuery({ search: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={searchParams.get('category') || ''} onChange={(e) => updateQuery({ category: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group price-group">
          <label>Price (₹)</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={searchParams.get('minPrice') || ''}
              onChange={(e) => updateQuery({ minPrice: e.target.value })}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={searchParams.get('maxPrice') || ''}
              onChange={(e) => updateQuery({ maxPrice: e.target.value })}
            />
          </div>
        </div>
        <div className="filter-group">
          <label htmlFor="sort">Sort by price</label>
          <select id="sort" value={searchParams.get('sort') || 'asc'} onChange={(e) => updateQuery({ sort: e.target.value })}>
            <option value="asc">Low to high</option>
            <option value="desc">High to low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading products..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filters."
          actionLabel="Clear filters"
          onAction={() => {
            setSearchParams(new URLSearchParams());
          }}
        />
      ) : (
        <>
          <div className="product-results">
            <ProductGrid products={products} />
          </div>
          <Pagination
            page={page}
            total={total}
            limit={12}
            onChange={(nextPage) => {
              setPage(nextPage);
              updateQuery({ page: nextPage });
            }}
          />
        </>
      )}
    </div>
  );
}
