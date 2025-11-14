import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


const API = "http://localhost:5000";


export const fetchProjects = createAsyncThunk(
  "projects/fetchAll", 
  async ({ token, page = 1 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/api/projects/get-projects`, { 
        params: { page },
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        } 
      });
      
      return {
        projects: res.data.data || [],
        pagination: res.data.pagination || { page: 1, pages: 1, total: 0, limit: 6 }
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);


export const createProject = createAsyncThunk(
  "projects/create", 
  async ({ data, token }, { rejectWithValue, dispatch }) => {
    try {
      const members = Array.isArray(data.members) ? [...new Set([...data.members])] : [];
      
      const projectData = {
        name: data.name,
        description: data.description || '',
        members
      };

      const res = await axios.post(
        `${API}/api/projects/create-project`, 
        projectData, 
        { 
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      

      await dispatch(fetchProjects({ token }));
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);


export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ projectId, data, token }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.put(
        `${API}/api/projects/update-project/${projectId}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
     
      await dispatch(fetchProjects({ token }));
      
      return res.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);


export const deleteProject = createAsyncThunk(
  'projects/delete',
  async ({ projectId, token }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.delete(
        `${API}/api/projects/delete-project/${projectId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          validateStatus: status => status < 500 
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete project');
      }
      
      
      await dispatch(fetchProjects({ token }));
      
      return { projectId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete project');
    }
  }
);


export const addMember = createAsyncThunk(
  'projects/addMember',
  async ({ projectId, memberEmail, token }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/api/projects/add-member/${projectId}`,
        { memberEmail },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return res.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);


export const fetchProjectMembers = createAsyncThunk(
  'projects/fetchMembers',
  async ({ projectId, token }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API}/api/projects/${projectId}/members`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { projectId, members: res.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project members');
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
    currentProject: null,
    members: [],
    loading: false,
    creating: false,
    error: null,
    pagination: {
      page: 1,
      pages: 1,
      total: 0,
      limit: 6
    }
  },
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.projects || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination
          };
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      
      .addCase(createProject.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          
          const filteredList = state.list.filter(project => project._id !== action.payload._id);
          state.list = [action.payload, ...filteredList];
          state.currentProject = action.payload;
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        state.loading = false;
      })
      
      
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          
          state.list = state.list.map(project => 
            project._id === action.payload._id ? action.payload : project
          );
          
          if (state.currentProject && state.currentProject._id === action.payload._id) {
            state.currentProject = action.payload;
          }
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to update project';
      })
      
     
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
     
        state.list = state.list.filter(project => project._id !== action.payload.projectId);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete project';
      })

           
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        const { projectId, members } = action.payload;
        
        const projectIndex = state.list.findIndex(p => p._id === projectId);
        if (projectIndex !== -1) {
          state.list[projectIndex].members = members;
        }
        
        if (state.currentProject?._id === projectId) {
          state.currentProject.members = members;
        }
      })
      
     
      .addCase(addMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.loading = false;
        const { project } = action.payload;
        
        
        const projectIndex = state.list.findIndex(p => p._id === project._id);
        if (projectIndex !== -1) {
          state.list[projectIndex] = project;
        }
        
        
        if (state.currentProject?._id === project._id) {
          state.currentProject = project;
        }
      })
      .addCase(addMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add member';
      });
  }
});

export const { setCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
