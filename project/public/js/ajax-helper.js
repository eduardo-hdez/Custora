
export async function fetchJSON(method = 'GET', url, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
      options.headers['x-csrf-token'] = csrfMeta.getAttribute('content');
    }

    const response = await fetch(url, options);

    const jsonResponse = await response.json();
    return {
      success: true,
      data: jsonResponse,
      error: null,
    };
  } catch (error) {
    
    return {
      success: false,
      data: null,
      error: error.message || 'Error desconocido',
    };
  }
}
