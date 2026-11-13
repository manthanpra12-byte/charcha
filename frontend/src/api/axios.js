import axios from 'axios';

// One shared Axios instance. Every request goes to /api/...
const api = axios.create({ baseURL: '/api' });

export default api;