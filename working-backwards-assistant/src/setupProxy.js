const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to your backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001', // Your backend server URL
      changeOrigin: true,
    })
  );
}; 