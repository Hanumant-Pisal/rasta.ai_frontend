import React, { useState } from 'react';
import { X, UserPlus, XCircle } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    onSubmit({
      name: projectName,
      description,
      members
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Project</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project description"
                rows="3"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Team Members
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember(e)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading || !emailInput.trim()}
                >
                  <UserPlus size={16} />
                </button>
              </div>
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              
              {members.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Team Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((email) => (
                      <div 
                        key={email} 
                        className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeMember(email)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                          disabled={loading}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading || !projectName.trim()}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
