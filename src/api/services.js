import api from './axios'

// ─── IMPORTANT ──────────────────────────────────────────────────────────────
// When sending FormData with axios, do NOT manually set Content-Type.
// Axios auto-sets 'multipart/form-data; boundary=...' with the correct boundary.
// Manually setting it strips the boundary and breaks the request (multer → 400).
// ────────────────────────────────────────────────────────────────────────────

export const projectsApi = {
  getAll:  ()         => api.get('/projects'),
  getById: (id)       => api.get(`/projects/${id}`),

  // ── Direct-upload flow (bypasses Vercel 4.5 MB limit) ───────────────────
  // Step 1: get a signed Cloudinary upload signature from the backend
  getUploadSignature: () => api.get('/projects/upload-signature'),

  // Step 2a: create project — send only Cloudinary URLs (JSON, no files)
  createWithUrls: (data) => api.post('/projects/save-urls', data),

  // Step 2b: update project — send only Cloudinary URLs (JSON, no files)
  updateWithUrls: (id, data) => api.put(`/projects/${id}/save-urls`, data),

  // ── Legacy routes (still work locally, hit Vercel limit for large files) ─
  create:  (data)     => api.post('/projects', data),   // FormData
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
  create: (data) => api.post('/testimonials', data),
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
