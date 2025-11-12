import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/tasks";

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async ({ projectId, token }, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API}/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Return the data array directly if it exists, otherwise return an empty array
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const updateTaskStatus = createAsyncThunk("tasks/updateStatus", async ({ id, status, token }) => {
  const res = await axios.put(`${API}/${id}`, { status }, { 
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    } 
  });
  return res.data;
});

export const createTask = createAsyncThunk(
  "tasks/create",
  async ({ projectId, title, description, assignee, dueDate, status = 'pending', token }, { rejectWithValue }) => {
    try {
      // Log the raw input for debugging
      console.log('Raw input:', { 
        projectId, 
        title, 
        description, 
        assignee,
        dueDate,
        status,
        token: token ? '***' : 'MISSING TOKEN'
      });

      // Ensure assignee is either a valid ID or null
      const assigneeId = assignee && assignee !== 'Unassigned' ? assignee : null;
      
      const taskData = {
        projectId, 
        title: title.trim(),
        description: description?.trim() || '',
        assignee: assigneeId,
        dueDate: dueDate || null,
        status: ['pending', 'in-progress', 'completed'].includes(status) ? status : 'pending',
        token // We'll handle this in the interceptor
      };

      console.log('Sending task data:', { ...taskData, token: '***' });

      const res = await axios.post(
        `${API}/`,
        taskData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );
      
      console.log('Response:', {
        status: res.status,
        data: res.data,
        headers: res.headers
      });
      
      if (!res.data) {
        return rejectWithValue({
          message: 'No response data from server',
          status: res.status,
          headers: res.headers
        });
      }
      
      if (!res.data.success) {
        return rejectWithValue({
          message: res.data.message || 'Failed to create task',
          errors: res.data.errors,
          status: res.status
        });
      }
      
      if (!res.data.success) {
        return rejectWithValue(res.data.message || 'Failed to create task');
      }
      
      return res.data;
    } catch (error) {
      console.error('Error creating task:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: { 
    list: [],
    loading: false,
    error: null
  },
  reducers: {
    clearTasks: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we're always setting an array
        state.list = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.list = []; // Reset list on error to prevent stale data
        state.error = action.payload || 'Failed to fetch tasks';
      })
      
      // Update Task Status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          const idx = state.list.findIndex((t) => t?._id === action.payload._id);
          if (idx !== -1) {
            state.list = [
              ...state.list.slice(0, idx),
              action.payload,
              ...state.list.slice(idx + 1)
            ];
          }
        }
      })
      
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.list = [...state.list, action.payload];
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create task';
      });
  }
});

export const { clearTasks } = taskSlice.actions;

export default taskSlice.reducer;
