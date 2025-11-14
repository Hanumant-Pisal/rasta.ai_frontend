import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/tasks";


export const fetchTasks = createAsyncThunk("tasks/fetchByProject", async ({ projectId, token }, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API}/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    
    const tasks = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    
    return tasks.map(task => ({
      ...task,
   
      status: mapToDisplayStatus(task.status)
    }));
    
    function mapToDisplayStatus(status) {
      
      return ['To Do', 'In Progress', 'Done'].includes(status) ? status : 'To Do';
    }
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
      
      console.log('Raw input:', { 
        projectId, 
        title, 
        description, 
        assignee,
        dueDate,
        status,
        token: token ? '***' : 'MISSING TOKEN'
      });

      
      const assigneeId = assignee && assignee !== 'Unassigned' ? assignee : null;
      

      const backendStatus = ['To Do', 'In Progress', 'Done'].includes(status) 
        ? status 
        : 'To Do';
      
      console.log('Using status:', { original: status, using: backendStatus });
      
      const taskData = {
        projectId, 
        title: title.trim(),
        description: description?.trim() || '',
        assignee: assigneeId,
        dueDate: dueDate || null,
        status: backendStatus,
        token
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
          validateStatus: (status) => status < 500 
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
     
        state.list = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.list = []; 
        state.error = action.payload || 'Failed to fetch tasks';
      })
      
     
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
      })
      
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.list = [];
        state.error = action.payload || 'Failed to fetch tasks';
      });
  }
});

export const fetchAllTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasks = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      return tasks.map(task => ({
        ...task,
        status: ['To Do', 'In Progress', 'Done'].includes(task.status) ? task.status : 'To Do'
      }));
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const { clearTasks } = taskSlice.actions;

export default taskSlice.reducer;
