import api from './axios'

// API Services
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/projects/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const servicesApi = {
  getAll: () => api.get('/services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
}

export const testimonialsApi = {
  getAll: () => api.get('/testimonials'),
  create: (data) => api.post('/testimonials', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/testimonials/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/testimonials/${id}`),
}

export const contactApi = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
}

export const bookingsApi = {
  submit: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
}

export const consultationAPI = {
  create: (data) => bookingsApi.submit(data),
}

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
}
