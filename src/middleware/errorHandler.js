const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 🆕 Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload. Please check your request body.';
  }

  // Handle express-validator errors
  if (err.errors && Array.isArray(err.errors)) {
    statusCode = 400;
    message = err.errors.map(e => e.msg).join(', ');
  }

  // For AppError (operational errors), use their message
  if (err.isOperational) {
    message = err.message;
  }

  // Production: hide 500 details
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  console.error(`❌ Error: ${err.message} | Status: ${statusCode}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      status: statusCode,
    },
  });
};

module.exports = errorHandler;