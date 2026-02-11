/**
 * Extract and format error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  // Check for validation errors (400 status)
  if (error.response?.status === 400 && error.response?.data?.errors) {
    const validationErrors = error.response.data.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors.map((err: { msg: string }) => err.msg).join(", ");
    }
  }

  // Check for custom error message from backend
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check for axios error message
  if (error.message) {
    return error.message;
  }

  // Default error message
  return "An unexpected error occurred. Please try again.";
};

/**
 * Extract field-specific validation errors
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  if (error.response?.status === 400 && error.response?.data?.errors) {
    const validationErrors = error.response.data.errors;
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((err: { path: string; msg: string }) => {
        if (err.path) {
          fieldErrors[err.path] = err.msg;
        }
      });
    }
  }

  return fieldErrors;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  return (
    error.response?.status === 400 &&
    error.response?.data?.message === "Validation error"
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  return error.response?.status === 401;
};

/**
 * Log error details for debugging
 */
export const logError = (context: string, error: unknown): void => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack,
  });
};
