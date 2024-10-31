module.exports = (req, res) => {
  res.json({
    message: 'Hello from Vercel serverless function!',
    method: req.method,
    url: req.url
  });
};