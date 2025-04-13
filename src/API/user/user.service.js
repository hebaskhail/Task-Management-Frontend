import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  async getProfile(token) {
    try {
      const response = await axios.get(
        `${API_URL}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
};