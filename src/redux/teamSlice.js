import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'http://localhost:5000';


export const fetchAllMembers = createAsyncThunk(
  'team/fetchAllMembers',
  async (_, { getState, rejectWithValue }) => {
    try {
      
      const state = getState();
      
      const token = state.auth?.user?.token || localStorage.getItem('token');

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      console.log('Fetching members from:', `${API}/api/users/members`);
      const response = await axios.get(`${API}/api/users/members`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 
      });

      console.log('Members API Response:', response.data);
      
     
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data; 
      }
      
      
      console.warn('Unexpected API response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching members:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);


export const deleteMember = createAsyncThunk(
  'team/deleteMember',
  async (memberId, { getState, rejectWithValue }) => {
    try {
      console.log('Attempting to delete member with ID:', memberId);
      const state = getState();
      console.log('Current auth state:', state.auth);
      
      const token = state.auth?.user?.token || localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');

      if (!token) {
        console.error('No authentication token found');
        return rejectWithValue('No authentication token found');
      }

      console.log('Sending DELETE request to:', `${API}/api/users/members/${memberId}`);
      
      const response = await axios.delete(`${API}/api/users/members/${memberId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response:', response.data);

      if (response.data.success) {
        console.log('Successfully deleted member:', memberId);
        return memberId;
      }

      console.error('Delete failed with response:', response.data);
      return rejectWithValue(response.data.message || 'Failed to delete member');
    } catch (error) {
      console.error('Error deleting member:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to delete member');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    members: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload || [];
      })
      .addCase(fetchAllMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load members';
      })
      .addCase(deleteMember.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        
        state.members = state.members.filter(member => member._id !== action.payload);
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete member';
      });
  }
});

export default teamSlice.reducer;
