import api from './axios'

export const projectsApi = {
  getAll:  ()         => api.get('/projects'),
  getById: (id)       => api.get(`/projects/${id}`),
  create:  (data)     => api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.put(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id)       => api.delete(`/projects/${id}`),
}

export const servicesApi = {
  getAll:  ()         => api.get('/services'),
  create:  (data)     => api.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.put(`/services/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id)       => api.delete(`/services/${id}`),
}

export const testimonialsApi = {
  getAll:  ()         => api.get('/testimonials'),
  create:  (data)     => api.post('/testimonials', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.put(`/testimonials/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id)       => api.delete(`/testimonials/${id}`),
}

export const contactApi = {
  submit:       (data)     => api.post('/contact', data),
  getAll:       ()         => api.get('/contact'),
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
