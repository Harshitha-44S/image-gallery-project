const API_BASE_URL = 'http://localhost:5002/api';

export const imageAPI = {
  // Get all images
  getAll: async (searchQuery = '') => {
    const response = await fetch(`${API_BASE_URL}/images?search=${encodeURIComponent(searchQuery)}`);
    return await response.json();
  },

  // Upload image
  upload: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Upload failed. Please try again.');
    }
    return await response.json();
  },

  // Delete image
  delete: async (imageId) => {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Delete failed. Please try again.');
    }
    return await response.json();
  },

  // Get signed URL for specific image
  getSignedUrl: async (imageId) => {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}/signed-url`);
    return await response.json();
  }
};