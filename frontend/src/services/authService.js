import api from './api';

export const authService = {
    signup: (data) => api.post('/auth/signup', data).then(r => r.data),
    login: (data) => api.post('/auth/login', data).then(r => r.data),
};
