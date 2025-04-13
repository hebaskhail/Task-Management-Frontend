import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return true;
    }
};