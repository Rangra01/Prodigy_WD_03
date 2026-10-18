const isProduction = process.env.NODE_ENV === 'production';

export default function errorHandler(err, _req, res, _next) {
  console.error('Server error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', message: err.message });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  const response = { error: message };
  if (!isProduction) {
    response.stack = err.stack;
  }

  return res.status(status).json(response);
}
