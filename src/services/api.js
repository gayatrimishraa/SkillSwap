// API calling helper service
const API_URL = ''; // Proxied by Vite to http://localhost:5000/api

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  },

  auth: {
    register: (userData) => api.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (credentials) => api.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    me: () => api.request('/api/auth/me'),
    updateProfile: (profileData) => api.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  },

  jobs: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/api/jobs${query ? '?' + query : ''}`);
    },
    getMine: () => api.request('/api/jobs/mine'),
    create: (jobData) => api.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),
    getById: (id) => api.request(`/api/jobs/${id}`),
    update: (id, jobData) => api.request(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),
  },

  applications: {
    apply: (jobId) => api.request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    }),
    getMine: () => api.request('/api/applications/mine'),
    getByJobId: (jobId) => api.request(`/api/applications/job/${jobId}`),
    getAllForProvider: () => api.request('/api/applications/provider/all'),
    updateStatus: (id, status) => api.request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  },

  reviews: {
    submit: (reviewData) => api.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
    getForWorker: (workerId) => api.request(`/api/reviews/worker/${workerId}`),
  },
};

export default api;
