const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  console.error(`❌ Error: ${err.message} | Status: ${statusCode}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' && !err.isOperational 
        ? 'Something went wrong' 
        : message,
      status: statusCode,
    },
  });
};

module.exports = errorHandler;