import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../redux/taskSlice';
import { fetchProjectMembers, setCurrentProject } from '../redux/projectSlice';


const selectProjects = (state) => state.projects;

const TaskModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const projectsState = useSelector((state) => state.projects);
  
  
  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' }
  ];

  
  const mapToBackendStatus = (status) => {
    return ['To Do', 'In Progress', 'Done'].includes(status) ? status : 'To Do';
  };
  
  const mapToDisplayStatus = (status) => {
    return ['To Do', 'In Progress', 'Done'].includes(status) ? status : 'To Do';
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: user?._id || 'Unassigned',
    dueDate: '',
    status: 'To Do' 
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const project = projectsState.list?.find(p => p._id === projectId) || projectsState.currentProject;
  
  
  const projectMembers = project?.members || [];
  
  
  useEffect(() => {
    console.log('Current project:', project);
    console.log('Project members:', projectMembers);
    
    if (project?.members) {
      console.log('Members array exists, length:', project.members.length);
    } else {
      console.log('No members array in project data');
    }
  }, [project, projectMembers]);
  
  
  const memberOptions = useMemo(() => {
    if (!projectMembers || !Array.isArray(projectMembers)) return [];
    
    return projectMembers.map(member => {
      
      if (typeof member === 'string') {
        return { _id: member, name: 'Loading...', email: '' };
      }
      
      return {
        _id: member._id,
        name: member.name,
        email: member.email 
      };
    });
  }, [projectMembers]);

  
  useEffect(() => {
    if (isOpen && projectId) {
      dispatch(fetchProjectMembers({ projectId, token }));
    }
  }, [isOpen, projectId, dispatch, token]);
  
  
  useEffect(() => {
    if (projectId && !projectsState.currentProject) {
      const project = projectsState.list?.find(p => p._id === projectId);
      if (project) {
        dispatch(setCurrentProject(project));
      }
    }
  }, [projectId, projectsState.currentProject, projectsState.list, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError({ message: 'Title is required', field: 'title' });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
     
      const taskData = {
        projectId,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        assignee: formData.assignee === 'Unassigned' ? null : formData.assignee,
        dueDate: formData.dueDate || null,
        status: mapToBackendStatus(formData.status),
        token
      };

      console.log('Submitting task data:', {
        ...taskData,
        token: '***' 
      });
      
      const resultAction = await dispatch(createTask(taskData));
      
      if (createTask.fulfilled.match(resultAction)) {
        console.log('Task created successfully:', resultAction.payload);
        
        setFormData({
          title: '',
          description: '',
          assignee: user?._id || 'Unassigned',
          dueDate: '',
          status: 'To Do' 
        });
        onClose();
      } else if (createTask.rejected.match(resultAction)) {
        const errorData = resultAction.payload;
        console.error('Task creation failed:', errorData);
        
        
        if (errorData?.errors) {
          const firstError = Object.values(errorData.errors)[0];
          setError({
            message: firstError || 'Validation error',
            field: Object.keys(errorData.errors)[0]
          });
        } else {
          setError({
            message: errorData?.message || 'Failed to create task',
            field: null
          });
        }
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      setError({
        message: 'An unexpected error occurred. Please try again.',
        field: null
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} 
    >
      <div 
        className="bg-white rounded-lg w-full max-w-md"
        onClick={handleModalClick} 
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Create New Task</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div 
            className={`p-4 mb-4 rounded ${
              error.field === 'title' ? 'border-l-4 border-yellow-500 bg-yellow-50' : 'border-l-4 border-red-500 bg-red-50'
            }`}
            role="alert"
          >
            <p className={`${error.field === 'title' ? 'text-yellow-700' : 'text-red-700'}`}>
              {error.message}
              {error.field && (
                <span className="block mt-1 text-sm">
                  Please check the <span className="font-semibold">{error.field}</span> field.
                </span>
              )}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Task description"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <div className="relative">
                <select
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  disabled={isSubmitting || memberOptions.length === 0}
                >
                  <option value="">
                    {memberOptions.length === 0 ? 'Loading members...' : 'Select an assignee'}
                  </option>
                 
                  {memberOptions.map(member => (
                    <option 
                      key={member._id} 
                      value={member._id}
                      className="flex items-center"
                    >
                      {member.name} {member.email && `(${member.email})`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={isSubmitting}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
