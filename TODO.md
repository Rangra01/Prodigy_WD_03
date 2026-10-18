# TODO - Local Store E-commerce Platform

## Phase 1: Inspection (DONE)
- Workspace is empty; Node v24.18.0, npm 11.16.0, MySQL 8.0.46 running
- No MySQL admin credentials available (no sudo password, root/auth_socket denied) -> app will be fully implemented; DB creation documented as a manual step

## Phase 2: Project structure & package config
- [ ] Root .gitignore, README.md
- [ ] backend/package.json, .env.example, server.js
- [ ] frontend/package.json, .env.example, vite.config.js, index.html

## Phase 3: Database
- [ ] backend/database/schema.sql (users, products, cart_items, orders, order_items)
- [ ] backend/database/seed.sql (12-15 products, idempotent)
- [ ] backend/config/db.js (mysql2 pool)

## Phase 4: Backend
- [ ] middleware: auth, admin, error handler
- [ ] validators: auth, product, cart, order
- [ ] controllers: auth, product, cart, order (transactional checkout, stock rules, status transitions)
- [ ] routes: auth, product, cart, order
- [ ] scripts/create-admin.js (protected, env-based)

## Phase 5-6: Frontend
- [ ] src structure: main.jsx, App.jsx, index.css, api client, auth context, cart hook
- [ ] Shared components: Navbar, Footer, ProductCard, ProductGrid, Search, filters, pagination, loading, errors, empty state, confirm dialog, protected routes
- [ ] Customer pages: Home, ProductList, ProductDetail, Register, Login, Cart, Checkout, OrderConfirmation, MyOrders, OrderDetail, NotFound
- [ ] Admin pages: Dashboard, Product management, Add/Edit product, Order management, Order detail

## Phase 7-8: Security, states, styling, seed data
- [ ] HttpOnly cookie auth, CORS credentials, rate limiting, Helmet, ownership checks
- [ ] Loading/empty/error/success states, INR formatting, image fallbacks, responsive CSS

## Phase 9: Verification
- [ ] npm install both sides
- [ ] Backend unit tests (mocked db) pass
- [ ] Frontend production build succeeds
- [ ] API smoke checks (if MySQL configured)

## Phase 10: Docs
- [ ] README setup instructions
- [ ] TODO.md final status