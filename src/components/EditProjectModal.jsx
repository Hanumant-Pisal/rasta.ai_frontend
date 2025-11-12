import React, { useState, useEffect } from 'react';
import { X, UserPlus, XCircle } from 'lucide-react';

const EditProjectModal = ({ isOpen, onClose, onSubmit, project, loading }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setProjectName(project.name || '');
      setDescription(project.description || '');
      // Extract email addresses from member objects if they exist
      const memberEmails = project.members?.map(member => 
        typeof member === 'object' ? member.email : member
      ) || [];
      setMembers(memberEmails);
    }
  }, [project]);

  const handleAddMember = (e) => {
    e.preventDefault();
    const email = emailInput.trim();
    
    if (!email) return;
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (members.includes(email)) {
      setError('This email is already added');
      return;
    }
    
    setMembers([...members, email]);
    setEmailInput('');
    setError('');
  };

  const removeMember = (email) => {
    setMembers(members.filter(m => m !== email));
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
        members
      });
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email to add team member"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              >
                <UserPlus size={16} className="mr-1" /> Add
              </button>
            </div>
            
            {members.length > 0 && (
              <div className="mt-2 space-y-2">
                {members.map((member, index) => {
                  // Handle both object and string member formats
                  const email = typeof member === 'object' ? member.email : member;
                  const key = typeof member === 'object' ? member._id || `member-${index}` : `member-${index}`;
                  
                  return (
                    <div key={key} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                      <span className="text-sm text-gray-700">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeMember(email)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={loading}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  );
                })}
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
