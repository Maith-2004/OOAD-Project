// config/api.js
// Centralized API configuration

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8081');

export default API_BASE_URL;
