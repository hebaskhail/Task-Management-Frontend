import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default {
    async getTasks(token) {
        try {
            console.log('Attempting to fetch tasks');

            const response = await axios.get(`${API_BASE_URL}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data.tasks || [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    async addTask(token, taskData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/tasks`,
                {
                    title: taskData.title,
                    description: taskData.description,
                    dueDate: taskData.dueDate,
                    priority: taskData.priority
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.data; // Return created task
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    },

    async completeTask(token, taskId) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/tasks/mark-completed/${taskId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data.data; // Return updated task
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    },

    async deleteTask(token, taskId) {
        try {
            await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return true; // Indicate success
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
};