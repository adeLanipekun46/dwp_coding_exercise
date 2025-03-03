// employeeApiClient.js
import axios from 'axios';

const BASE_URL = 'https://apisforemployeecatalogmanagementsystem.onrender.com';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
    timeout: 10000,
    withCredentials: true
});

const employeeApiClient = {

    /**
     * 
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<token>}
     */
    async login(username, password) {
        return await apiClient.post('/hr/login', { username, password });
    },

    /**
     * 
     * @param {string} token 
     * @param {object} employeeData 
     * @returns {Promise<object>}
     */
    async createEmployee(token, employeeData) {
        return await apiClient.post('/employees', employeeData, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    /**
     * 
     * @param {string} token 
     * @returns {Promise<object>}
     */
    async getEmployees(token) {
        return await apiClient.get('/employees', {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    /**
     * 
     * @param {string} token 
     * @param {string} employeeId 
     * @returns {Promise<object>}
     */
    async getEmployeeById(token, employeeId) {
        return await apiClient.get(`/employees/${employeeId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    /**
     * 
     * @param {string} token 
     * @param {string} employeeId 
     * @param {object} employeeData 
     * @returns 
     */
    async updateEmployee(token, employeeId, employeeData) {
        return await apiClient.put(`/employees/${employeeId}`, employeeData, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    /**
     * 
     * @param {string} token 
     * @param {string} employeeId 
     * @returns 
     */
    async deleteEmployee(token, employeeId) {
        return await apiClient.delete(`/employees/${employeeId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
}

export default employeeApiClient;