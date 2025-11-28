// Export all API modules
export { authAPI } from './auth';
export { productsAPI } from './products';
export { ordersAPI } from './orders';
export { usersAPI } from './users';
export { adminsAPI } from './admins';
export { tagsAPI } from './tags';
export { messagesAPI } from './messages';

// API base URL for use in components
export const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api`;
