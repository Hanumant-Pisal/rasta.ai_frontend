import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL - make sure this matches your backend URL
const API = "http://localhost:5000";

// Get all projects for the logged-in user with pagination
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

// Create a new project
export const createProject = createAsyncThunk(
  "projects/create", 
  async ({ data, token }, { rejectWithValue, dispatch }) => {
    try {
      // Ensure members is an array and add the current user as the first member if not already included
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
      
      // Fetch the updated project list to ensure we have the latest data
      await dispatch(fetchProjects({ token }));
      
      return res.data;
    } catch (error) {
      console.error('Error creating project:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

// Update a project
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
      
      // Refresh the projects list to ensure we have the latest data
      await dispatch(fetchProjects({ token }));
      
      return res.data; // Should contain the updated project
    } catch (error) {
      console.error('Error updating project:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

// Delete a project
export const deleteProject = createAsyncThunk(
  'projects/delete',
  async ({ projectId, token }, { rejectWithValue, dispatch }) => {
    try {
      console.log('Deleting project with ID:', projectId);
      const response = await axios.delete(
        `${API}/api/projects/delete-project/${projectId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          validateStatus: status => status < 500 // Don't throw for 4xx errors
        }
      );

      console.log('Delete project response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete project');
      }
      
      // Refresh the projects list after successful deletion
      await dispatch(fetchProjects({ token }));
      
      return { projectId };
    } catch (error) {
      console.error('Error in deleteProject thunk:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete project');
    }
  }
);

// Add a member to a project
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
      return res.data; // Should contain { message, project }
    } catch (error) {
      console.error('Error adding member:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

// Fetch members for a specific project
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
      console.error('Error fetching project members:', error);
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
      // Fetch Projects
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
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          // Remove the project if it already exists to avoid duplicates
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
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Update the project in the list if it exists
          state.list = state.list.map(project => 
            project._id === action.payload._id ? action.payload : project
          );
          // Update current project if it's the one being edited
          if (state.currentProject && state.currentProject._id === action.payload._id) {
            state.currentProject = action.payload;
          }
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to update project';
      })
      
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        // The projects list will be refreshed from the server, but we can optimistically update
        state.list = state.list.filter(project => project._id !== action.payload.projectId);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete project';
      })

            // Fetch Project Members
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        const { projectId, members } = action.payload;
        // Update members for the project in the list
        const projectIndex = state.list.findIndex(p => p._id === projectId);
        if (projectIndex !== -1) {
          state.list[projectIndex].members = members;
        }
        // Also update currentProject if it's the one being viewed
        if (state.currentProject?._id === projectId) {
          state.currentProject.members = members;
        }
      })
      
      // Add Member
      .addCase(addMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.loading = false;
        const { project } = action.payload;
        
        // Update the project in the list
        const projectIndex = state.list.findIndex(p => p._id === project._id);
        if (projectIndex !== -1) {
          state.list[projectIndex] = project;
        }
        
        // Update currentProject if it's the one being viewed
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
