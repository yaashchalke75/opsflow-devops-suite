export function notFound(req, res, _next) {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = {
    error: err.message || 'Internal server error',
    ...(err.details && { details: err.details }),
  };
  if (process.env.NODE_ENV !== 'production' && status === 500) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}
