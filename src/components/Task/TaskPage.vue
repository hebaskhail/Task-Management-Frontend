<template>
  <div class="tasks-container">
    <!-- Top navigation bar -->
    <nav class="navbar">
      <div class="brand">Task Management</div>
      <div class="user-menu">
        <div class="user-info">
          <img :src="userAvatar" alt="User Avatar" class="avatar" />
          <span class="username">{{ user.name }}</span>
        </div>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Log Out
        </button>
      </div>
    </nav>

    <!-- Main content -->
    <div class="main-content">
      <!-- User profile card -->
      <div class="user-card">
        <div class="card-header">
          <img :src="userAvatar" alt="User Avatar" class="profile-img" />
          <h2>Hello, {{ user.name }}</h2>
        </div>
        <div class="card-body">
          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar-alt"></i>
            <span
              ><b>Registration Date:</b> {{ formatDate(user.createdAt) }}</span
            >
          </div>
         
        </div>
      </div>

      <!-- Tasks section -->
      <div class="tasks-section">
        <h2 class="section-title">Your Tasks Today</h2>
        <!-- زر لإظهار النموذج -->
        <button @click="showTaskForm = true" class="add-task-toggle-btn">
          <i class="fas fa-plus"></i> Add Task
        </button>

        <!-- Add new task form -->
        <div class="add-task">
          <!-- نموذج إضافة المهمة -->
          <div v-if="showTaskForm" class="add-task">
            <form @submit.prevent="validateAndAddTask">
              <div class="form-group">
                <input
                  v-model="newTaskTitle"
                  placeholder="Task Title"
                  class="task-input"
                  :class="{ 'error-input': errors.title }"
                />
                <span class="error-message" v-if="errors.title">{{
                  errors.title
                }}</span>
              </div>

              <div class="form-group">
                <textarea
                  v-model="newTaskDescription"
                  placeholder="Task Description"
                  class="task-textarea"
                  :class="{ 'error-input': errors.description }"
                ></textarea>
                <span class="error-message" v-if="errors.description">{{
                  errors.description
                }}</span>
              </div>

              <div class="form-group">
                <select v-model="newTaskPriority" class="task-select">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div class="form-group">
                <input
                  v-model="newTaskDueDate"
                  type="date"
                  class="task-input"
                  :class="{ 'error-input': errors.dueDate }"
                />
                <span class="error-message" v-if="errors.dueDate">{{
                  errors.dueDate
                }}</span>
              </div>

              <div class="btn-group">
                <!-- زر الإلغاء -->
                <button type="button" @click="cancelForm" class="cancel-btn">
                  Cancel
                </button>

                <!-- زر الإضافة -->
                <button type="submit" class="add-btn">
                  <i class="fas fa-plus"></i> Add Task
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Filter & Pagination Controls -->
        <div class="filter-pagination">
          <!-- فلترة المهام حسب الحالة -->
          <label for="statusFilter">Filter by status:</label>
          <select
            v-model="selectedStatusFilter"
            id="statusFilter"
            class="task-select"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <!-- Tasks list -->
        <div class="tasks-list">
          <div
            v-for="task in paginatedTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.status === 'Completed' }"
          >
            <div class="task-content">
              <div class="task-details">
                <span class="task-title">{{ task.title }}</span>
                <p class="task-description">{{ task.description }}</p>
                <span class="task-priority"
                  ><b>Priority:</b> {{ task.priority }}</span
                >
                <span class="task-due-date"
                  ><b>Due Date:</b> {{ formatDate(task.dueDate) }}</span
                >
                <span class="task-status"
                  ><b>Status:</b> {{ task.status }}</span
                >
              </div>
            </div>
            <!-- إذا كانت المهمة غير مكتملة يظهر زر لإكمالها -->
            <button
              v-if="task.status !== 'Completed'"
              @click="completeTask(task.id)"
              class="complete-btn"
            >
              Make as complete
            </button>
            <!-- وإذا كانت مكتملة يظهر نص "Completed" -->
            <span v-else class="completed-text">Completed</span>
            <button @click="removeTask(task.id)" class="delete-btn">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <!-- Pagination Controls -->
        <div class="pagination-controls">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "TasksPage",
  data() {
    return {
      showTaskForm: false,
      user: {
        id: "",
        name: "Loading...",
        email: "",
        createdAt: "",
      },
      newTaskTitle: "",
      newTaskDescription: "",
      newTaskPriority: "Low",
      newTaskDueDate: "",
      selectedStatusFilter: "",
      currentPage: 1,
      pageSize: 5,
      errors: {
        title: "",
        description: "",
        dueDate: "",
      },
      tasks: [],
    };
  },
  computed: {
    userAvatar() {
      const name = this.user.name || "User";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random`;
    },
    filteredTasks() {
      if (!Array.isArray(this.tasks)) {
        return []; // إرجاع مصفوفة فارغة إذا لم تكن tasks مصفوفة
      }
      if (this.selectedStatusFilter === "") {
        return this.tasks;
      }
      return this.tasks.filter(
        (task) => task.status === this.selectedStatusFilter
      );
    },
    totalPages() {
      return Math.ceil(this.filteredTasks.length / this.pageSize) || 1;
    },
    paginatedTasks() {
      if (!Array.isArray(this.filteredTasks)) {
        return []; // تأكد أن filteredTasks مصفوفة قبل استدعاء slice
      }
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTasks.slice(start, end);
    },
  },
  created() {
    this.fetchUserData();
    this.fetchTasks();
  },
  watch: {
    selectedStatusFilter() {
      this.currentPage = 1;
    },
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {
        title: "",
        description: "",
        dueDate: "",
      };

      if (!this.newTaskTitle.trim()) {
        this.errors.title = "Task title is required";
        isValid = false;
      }

      if (!this.newTaskDescription.trim()) {
        this.errors.description = "Task description is required";
        isValid = false;
      }

      if (!this.newTaskDueDate) {
        this.errors.dueDate = "Due date is required";
        isValid = false;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(this.newTaskDueDate);
        if (dueDate < today) {
          this.errors.dueDate = "Due date cannot be in the past";
          isValid = false;
        }
      }

      return isValid;
    },
    validateAndAddTask() {
      if (this.validateForm()) {
        this.addTask();
      }
    },
    cancelForm() {
      this.showTaskForm = false;
      this.errors = {
        title: "",
        description: "",
        dueDate: "",
      };
    },
    async fetchUserData() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          this.$router.push("/login");
          return;
        }
        const response = await axios.get(
          "https://task-management-system-8ynn.onrender.com/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.user = response.data.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        this.$router.push("/login");
      }
    },
    async fetchTasks() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://task-management-system-8ynn.onrender.com/api/tasks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.tasks = response.data.data.tasks;
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return "Unknown";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    },
    async logout() {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:8000/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        localStorage.removeItem("token");
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
    async addTask() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "https://task-management-system-8ynn.onrender.com/api/tasks",
          {
            title: this.newTaskTitle.trim(),
            description: this.newTaskDescription.trim(),
            dueDate: this.newTaskDueDate,
            priority: this.newTaskPriority,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        this.newTaskTitle = "";
        this.newTaskDescription = "";
        this.newTaskPriority = "Low";
        this.newTaskDueDate = "";
        this.showTaskForm = false;

        Swal.fire("Added!", "Task added successfully", "success");

        this.fetchTasks();
      } catch (error) {
        console.error("Error adding task:", error);

        if (error.response) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert("Failed to add task. Please try again.");
        }
      }
    },
    async completeTask(taskId) {
      try {
        await axios.put(
          `https://task-management-system-8ynn.onrender.com/api/tasks/mark-completed/${taskId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        this.fetchTasks();

        Swal.fire("Completed!", "Task has been completed.", "success");
        
      } catch (error) {
        console.error("Error updating task:", error);

        if (error.response) {
          alert(
            `Error: ${error.response.data.message || "Failed to update task"}`
          );
        }
      }
    },
    async removeTask(taskId) {
      if (!confirm("Are you sure you want to delete this task?")) {
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // Optimistic UI update
        this.tasks = this.tasks.filter((task) => task.id !== taskId);

        await axios.delete(
          `https://task-management-system-8ynn.onrender.com/api/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire("Deleted!", "Task has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting task:", error);

        // Revert UI if API call fails
        this.fetchTasks(); // Refresh from server

        // Show error to user
        if (error.response) {
          alert(
            `Error: ${error.response.data.message || "Failed to delete task"}`
          );
        }
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  },
};
</script>

<style scoped>
/* General design */
.tasks-container {
  font-family: "Tajawal", sans-serif;
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #2d3748;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.username {
  font-weight: 500;
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Main content */
.main-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* User card */
.user-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
  color: white;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  margin-bottom: 1rem;
}

.card-body {
  padding: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #edf2f7;
}

.info-item i {
  color: #718096;
  width: 20px;
  text-align: center;
}

/* Tasks section */
.tasks-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4361ee, #4cc9f0);
  border-radius: 3px;
}

/* Add task form styles */
.add-task form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-input,
.task-textarea,
.task-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.task-input:focus,
.task-textarea:focus,
.task-select:focus {
  outline: none;
  border-color: #4361ee;
}

.task-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-input {
  border-color: #e53e3e;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: -0.25rem;
  margin-bottom: 0.5rem;
}

.add-btn {
  background-color: #4361ee;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-btn:hover {
  background-color: #3a0ca3;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-task-toggle-btn {
  margin-bottom: 20px;
}

.add-task-toggle-btn,
.cancel-btn {
  background-color: #ccc;
  color: #333;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 5px;
}

.cancel-btn:hover {
  background-color: #f2f2f2;
  color: #333;
  border-color: #bbb;
}

.add-task-toggle-btn:hover,
.cancel-btn:hover {
  background-color: #bbb;
}

/* Filter & Pagination styles */
.filter-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .filter-pagination {
    flex-wrap: wrap;
    gap: 25px;
    justify-content: center;
  }
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 25px;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tasks list styles */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .task-item {
    flex-wrap: wrap;
    gap: 25px;
  }
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #a0aec0;
}

.delete-btn {
  background-color: transparent;
  color: #e53e3e;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
}

.delete-btn:hover {
  color: #c53030;
}

.task-details {
  margin-left: 0.75rem;
  min-width: 450px;
}

@media (max-width: 768px) {
  .task-details {
    min-width: auto;
  }
}

.task-title {
  font-weight: 600;
}

.task-description {
  font-size: 0.9rem;
  color: #555;
}

.task-priority,
.task-due-date,
.task-status {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.25rem;
  margin-right: 10px;
}

@media (max-width: 768px) {
  .task-priority,
  .task-due-date,
  .task-status {
    display: block;
  }
}
/* Complete button styles */
.complete-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background-color 0.3s ease;
}

.complete-btn:hover {
  background-color: #27ae60;
}

.completed-text {
  font-weight: bold;
  color: #27ae60;
  margin-right: 0.5rem;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
