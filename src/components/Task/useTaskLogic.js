// src/components/task/useTaskLogic.js
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import taskService from '@/API/task/task.service';
import userService from '@/API/user/user.service';
import { formatDate } from '@/utils/dateFormatter';

export default function useTaskLogic() {
  const router = useRouter();
  const token = localStorage.getItem('token');

  // Reactive State
  const showTaskForm = ref(false);
  const user = ref({ 
    id: "",
    name: "Loading...", 
    email: "",
    createdAt: "" 
  });
  const tasks = ref([]);
  const newTaskTitle = ref("");
  const newTaskDescription = ref("");
  const newTaskPriority = ref("Low");
  const newTaskDueDate = ref("");
  const selectedStatusFilter = ref("");
  const currentPage = ref(1);
  const pageSize = ref(5);
  const errors = ref({
    title: "",
    description: "",
    dueDate: ""
  });

  // Computed Properties
  const userAvatar = computed(() => {
    const name = user.value.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  });

  const filteredTasks = computed(() => {
    if (!Array.isArray(tasks.value)) return [];
    if (selectedStatusFilter.value === "") return tasks.value;
    return tasks.value.filter(task => task.status === selectedStatusFilter.value);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredTasks.value.length / pageSize.value) || 1;
  });

  const paginatedTasks = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredTasks.value.slice(start, end);
  });

  // Methods
  async function fetchUserData() {
    try {
      if (!token) {
        router.push("/login");
        return;
      }
      user.value = await userService.getProfile(token);
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/login");
    }
  }

  async function fetchTasks() {
    try {
      tasks.value = await taskService.getTasks(token);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  function validateForm() {
    let isValid = true;
    errors.value = { title: "", description: "", dueDate: "" };

    if (!newTaskTitle.value.trim()) {
      errors.value.title = "Task title is required";
      isValid = false;
    }

    if (!newTaskDescription.value.trim()) {
      errors.value.description = "Task description is required";
      isValid = false;
    }

    if (!newTaskDueDate.value) {
      errors.value.dueDate = "Due date is required";
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(newTaskDueDate.value);
      if (dueDate < today) {
        errors.value.dueDate = "Due date cannot be in the past";
        isValid = false;
      }
    }

    return isValid;
  }

  async function addTask() {
    try {
      await taskService.addTask(token, {
        title: newTaskTitle.value.trim(),
        description: newTaskDescription.value.trim(),
        dueDate: newTaskDueDate.value,
        priority: newTaskPriority.value
      });

      resetTaskForm();
      Swal.fire("Added!", "Task added successfully", "success");
      await fetchTasks();
    } catch (error) {
      handleError(error, "Failed to add task");
    }
  }

  function resetTaskForm() {
    newTaskTitle.value = "";
    newTaskDescription.value = "";
    newTaskPriority.value = "Low";
    newTaskDueDate.value = "";
    showTaskForm.value = false;
    errors.value = { title: "", description: "", dueDate: "" };
  }

  async function completeTask(taskId) {
    try {
      await taskService.completeTask(token, taskId);
      await fetchTasks();
      Swal.fire("Completed!", "Task has been completed.", "success");
    } catch (error) {
      handleError(error, "Failed to update task");
    }
  }

  async function removeTask(taskId) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4361ee',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await taskService.deleteTask(token, taskId);
      tasks.value = tasks.value.filter(task => task.id !== taskId);
      Swal.fire("Deleted!", "Task has been deleted.", "success");
    } catch (error) {
      handleError(error, "Failed to delete task");
      await fetchTasks();
    }
  }

  function logout() {
    // Frontend-only logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    
    Swal.fire({
      title: 'Logged Out',
      text: 'You have been successfully logged out',
      icon: 'success'
    });
  }

  function handleError(error, defaultMessage) {
    if (error.response) {
      Swal.fire('Error!', error.response.data.message || defaultMessage, 'error');
    } else {
      Swal.fire('Error!', defaultMessage, 'error');
    }
  }

  // Lifecycle
  onMounted(() => {
    fetchUserData();
    fetchTasks();
  });

  return {
    // State
    showTaskForm,
    user,
    tasks,
    newTaskTitle,
    newTaskDescription,
    newTaskPriority,
    newTaskDueDate,
    selectedStatusFilter,
    currentPage,
    errors,
    
    // Computed
    userAvatar,
    filteredTasks,
    totalPages,
    paginatedTasks,
    
    // Methods
    formatDate,
    fetchUserData,
    fetchTasks,
    validateForm,
    addTask,
    resetTaskForm,
    completeTask,
    removeTask,
    logout,
    handleError
  };
}