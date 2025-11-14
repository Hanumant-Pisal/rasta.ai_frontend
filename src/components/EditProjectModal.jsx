import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllMembers } from '../redux/teamSlice';
import { X, UserPlus, XCircle } from 'lucide-react';

const EditProjectModal = ({ isOpen, onClose, onSubmit, project, loading }) => {
  const dispatch = useDispatch();
  const { members: availableMembers, loading: membersLoading } = useSelector((state) => state.team);
  
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllMembers());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (project && availableMembers.length > 0) {
      setProjectName(project.name || '');
      setDescription(project.description || '');
      
      
      const projectMemberEmails = project.members?.map(member => 
        typeof member === 'object' ? member.email : member
      ) || [];
      
      const fullMembers = projectMemberEmails
        .map(email => availableMembers.find(m => m.email === email))
        .filter(Boolean);
      
      setMembers(fullMembers);
    }
  }, [project, availableMembers]);

  const handleAddMember = (e) => {
    e.preventDefault();
    
    if (!selectedMember) return;
    
    const memberToAdd = availableMembers.find(m => m._id === selectedMember);
    if (!memberToAdd) return;
    
    if (members.some(m => m.email === memberToAdd.email)) {
      setError('This member is already added');
      return;
    }
    
    setMembers([...members, memberToAdd]);
    setSelectedMember('');
    setError('');
  };

  const removeMember = (email) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    try {
      await onSubmit({
        name: projectName,
        description,
        members: members.map(m => m.email)
      });
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Enter project description"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Members
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedMember}
                onChange={(e) => {
                  setSelectedMember(e.target.value);
                  setError('');
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || membersLoading}
              >
                <option value="">Select a member...</option>
                {availableMembers
                  .filter(member => !members.some(m => m.email === member.email))
                  .map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center disabled:opacity-50"
                disabled={loading || !selectedMember}
              >
                <UserPlus size={16} className="mr-1" /> Add
              </button>
            </div>
            {membersLoading && <p className="text-sm text-gray-500 mb-2">Loading members...</p>}
            
            {members.length > 0 && (
              <div className="mt-2 space-y-2">
                {members.map((member) => (
                  <div 
                    key={member._id || member.email} 
                    className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{member.name}</span>
                      <span className="text-xs text-gray-500">{member.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(member.email)}
                      className="text-gray-400 hover:text-red-500"
                      disabled={loading}
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
