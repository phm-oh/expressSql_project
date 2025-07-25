/* 
File: js/api.js
Path: vue-user-management/js/api.js
Description: API helper functions สำหรับเรียก backend
*/

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000
};

// API Helper Class
class ApiService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    // Get token from localStorage
    getToken() {
        return localStorage.getItem('token');
    }

    // Set token to localStorage
    setToken(token) {
        localStorage.setItem('token', token);
    }

    // Remove token from localStorage
    removeToken() {
        localStorage.removeItem('token');
    }

    // Generic API call method
    async call(method, endpoint, data = null) {
        const config = {
            method: method.toUpperCase(),
            url: `${this.baseURL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: API_CONFIG.TIMEOUT
        };

        // Add token if exists
        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add data for POST/PUT requests
        if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.data = data;
        }

        try {
            const response = await axios(config);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('API Error:', error);
            
            // Handle 401 Unauthorized
            if (error.response?.status === 401) {
                this.removeToken();
                window.location.href = '../pages/login.html';
                return {
                    success: false,
                    message: 'กรุณาเข้าสู่ระบบใหม่'
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
                status: error.response?.status
            };
        }
    }

    // Authentication APIs
    async login(username, password) {
        return await this.call('POST', '/auth/login', { username, password });
    }

    async register(userData) {
        return await this.call('POST', '/auth/register', userData);
    }

    async verifyToken() {
        return await this.call('POST', '/auth/verify');
    }

    // User Profile APIs
    async getMyProfile() {
        return await this.call('GET', '/users/profile/me');
    }

    async updateMyProfile(userData) {
        return await this.call('PUT', '/users/profile/me', userData);
    }

    async changePassword(userId, newPassword) {
        return await this.call('PUT', `/users/${userId}/password`, { newPassword });
    }

    // Admin APIs
    async getAllUsers() {
        return await this.call('GET', '/users');
    }

    async getUserById(userId) {
        return await this.call('GET', `/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return await this.call('PUT', `/users/${userId}`, userData);
    }

    async deleteUser(userId) {
        return await this.call('DELETE', `/users/${userId}`);
    }

    // Server Info APIs
    async getServerInfo() {
        return await this.call('GET', '/');
    }

    async testDatabase() {
        return await this.call('GET', '/test-db');
    }
}

// Create global API instance
window.api = new ApiService();

// Helper Functions
window.ApiHelpers = {
    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    // Logout helper
    logout() {
        window.api.removeToken();
        window.location.href = '../pages/login.html';
    },

    // Check if user is admin
    isAdmin(user) {
        return user && user.role === 'admin';
    },

    // Format date
    formatDate(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Confirm dialog
    async confirmDelete(message = 'คุณต้องการลบข้อมูลนี้หรือไม่?') {
        return confirm(message);
    }
};

// Auto-redirect to login if token expires
window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) {
        window.location.href = '../pages/login.html';
    }
});