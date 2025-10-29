export const apiRequest = async (url, method, headers, endpoint, body = null) => {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const res = await fetch(`${url}${endpoint}`, config);

    // Handle different error scenarios
    if (!res.ok) {
      let errorMessage;
      let errorData = null;

      try {
        // Try to parse as JSON first (most APIs return JSON errors)
        errorData = await res.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`;
      } catch (parseError) {
        // Fallback to text if JSON parsing fails
        try {
          errorMessage = await res.text() || `HTTP ${res.status}: ${res.statusText}`;
        } catch (textError) {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
      }

      // Create a comprehensive error object
      const error = new Error(`API Request Failed: ${errorMessage}`);
      error.status = res.status;
      error.statusText = res.statusText;
      error.url = `${url}${endpoint}`;
      error.method = method;
      error.errorData = errorData;
      
      throw error;
    }

    // Handle successful responses
    const contentType = res.headers.get('content-type');
    
    // Check if response has content
    if (res.status === 204) {
      return null; // No content
    }
    
    // Parse JSON response
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    
    // Return text for non-JSON responses
    return await res.text();

  } catch (error) {
    // Re-throw API errors as-is
    if (error.status) {
      throw error;
    }
    
    // Handle network errors, timeouts, etc.
    const networkError = new Error(`Network Error: ${error.message}`);
    networkError.originalError = error;
    networkError.url = `${url}${endpoint}`;
    networkError.method = method;
    
    throw networkError;
  }
};