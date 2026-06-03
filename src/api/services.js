import api from './axios'

// ─── IMPORTANT ──────────────────────────────────────────────────────────────
// When sending FormData with axios, do NOT manually set Content-Type.
// Axios auto-sets 'multipart/form-data; boundary=...' with the correct boundary.
// Manually setting it strips the boundary and breaks the request (multer returns 400).
// ────────────────────────────────────────────────────────────────────────────

export const projectsApi = {
  getAll:  ()         => api.get('/projects'),
  getById: (id)       => api.get(`/projects/${id}`),
  create:  (data)     => api.post('/projects', data),   // FormData — no Content-Type header
  update:  (id, data) => api.put(`/projects/${id}`, data),
  delete:  (id)       => api.delete(`/projects/${id}`),
}

export const servicesApi = {
  getAll:  ()         => api.get('/services'),
  create:  (data)     => api.post('/services', data),
  update:  (id, data) => api.put(`/services/${id}`, data),
  delete:  (id)       => api.delete(`/services/${id}`),
}

export const testimonialsApi = {
  getAll: () => api.get('/testimonials'),

  // Public submit — isApproved:false, pending admin review
  create: (data) => api.post('/testimonials', data),

  // Admin create — isApproved:true, published immediately
  createByAdmin: (data) => api.post('/testimonials/admin-create', data),

  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id)       => api.delete(`/testimonials/${id}`),
}

export const contactApi = {
  submit:       (data)     => api.post('/contact', data),
  getAll:       ()         => api.get('/contact'),
  getById:      (id)       => api.get(`/contact/${id}`),
  updateStatus: (id, data) => api.patch(`/contact/${id}/status`, data),
  delete:       (id)       => api.delete(`/contact/${id}`),
}

export const bookingsApi = {
  submit:       (data)     => api.post('/bookings', data),
  getAll:       ()         => api.get('/bookings'),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  delete:       (id)       => api.delete(`/bookings/${id}`),
}

export const consultationAPI = {
  create: (data) => bookingsApi.submit(data),
}

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
}

export const paymentApi = {
  createOrder:   (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
}
