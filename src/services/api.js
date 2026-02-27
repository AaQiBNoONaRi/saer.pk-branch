import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('branch_access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage and redirect to login
            localStorage.removeItem('branch_access_token');
            localStorage.removeItem('branch_data');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Branch Auth API
export const branchAuthAPI = {
    /**
     * Login branch user
     * @param {string} email - Branch email (used as username)
     * @param {string} password
     * @returns {Promise} Response with access_token and branch data
     */
    login: async (email, password) => {
        const response = await api.post('/api/branches/login', {
            username: email, // backend now accepts `username` (can be email or custom username)
            password,
        });

        // Store token and branch data in localStorage
        if (response.data.access_token) {
            localStorage.setItem('branch_access_token', response.data.access_token);
            localStorage.setItem('branch_data', JSON.stringify(response.data.branch));
        }

        return response.data;
    },

    /**
     * Get current branch info
     * @returns {Promise} Branch data
     */
    getCurrentBranch: async () => {
        const response = await api.get('/api/branch-auth/me');
        return response.data;
    },

    /**
     * Logout branch user
     */
    logout: () => {
        localStorage.removeItem('branch_access_token');
        localStorage.removeItem('branch_data');
    },

    /**
     * Check if branch is authenticated
     * @returns {boolean}
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('branch_access_token');
    },

    /**
     * Get stored branch data
     * @returns {object|null}
     */
    getBranchData: () => {
        const data = localStorage.getItem('branch_data');
        return data ? JSON.parse(data) : null;
    },

    /**
     * Login employee
     * @param {string} empId
     * @param {string} password
     */
    loginEmployee: async (email, password) => {
        const response = await api.post('/api/employees/login-email', {
            email,
            password,
        });

        if (response.data.access_token) {
            localStorage.setItem('branch_access_token', response.data.access_token);
            localStorage.setItem('employee_data', JSON.stringify(response.data.employee));
            // Clear branch data if any
            localStorage.removeItem('branch_data');
        }

        return response.data;
    },

    getEmployeeData: () => {
        const data = localStorage.getItem('employee_data');
        return data ? JSON.parse(data) : null;
    },

    getUserData: () => {
        const branchData = localStorage.getItem('branch_data');
        if (branchData) return { ...JSON.parse(branchData), type: 'branch' };

        const employeeData = localStorage.getItem('employee_data');
        if (employeeData) return { ...JSON.parse(employeeData), type: 'employee' };

        return null;
    },
};

// Agency API
export const agencyAPI = {
    /**
     * Create new agency
     * @param {object} agencyData 
     */
    create: async (agencyData) => {
        const response = await api.post('/api/agencies/', agencyData);
        return response.data;
    },

    /**
     * Get all agencies for current branch
     * @param {string} branchId 
     */
    getAll: async (branchId) => {
        const response = await api.get(`/api/agencies/?branch_id=${branchId}`);
        return response.data;
    },

    /**
     * Get single agency
     * @param {string} id 
     */
    getOne: async (id) => {
        const response = await api.get(`/api/agencies/${id}`);
        return response.data;
    },

    /**
     * Update agency
     * @param {string} id 
     * @param {object} data 
     */
    update: async (id, data) => {
        const response = await api.put(`/api/agencies/${id}`, data);
        return response.data;
    },

    /**
     * Delete agency
     * @param {string} id 
     */
    delete: async (id) => {
        const response = await api.delete(`/api/agencies/${id}`);
        return response.data;
    },

    /**
     * Get agency statistics
     * @param {string} id - Agency ID
     * @returns {Promise} Stats object with bookings and payment data
     */
    getStats: async (id) => {
        const response = await api.get(`/api/agencies/${id}/stats`);
        return response.data;
    }
};

export const employeeAPI = {
    getAll: async (entityId) => {
        const response = await api.get('/api/employees/', {
            params: { entity_type: 'branch', entity_id: entityId }
        });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/api/employees/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/api/employees/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/api/employees/${id}`);
        return response.data;
    }
};

export default api;
