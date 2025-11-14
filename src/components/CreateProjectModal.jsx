import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllMembers } from '../redux/teamSlice';
import { X, UserPlus, XCircle } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onSubmit, loading }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    onSubmit({
      name: projectName,
      description,
      members: members.map(m => m.email)
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
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading || !selectedMember}
                >
                  <UserPlus size={16} />
                </button>
              </div>
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              {membersLoading && <p className="mt-1 text-sm text-gray-500">Loading members...</p>}
              
              {members.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Team Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <div 
                        key={member.email} 
                        className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg text-sm border border-blue-200"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          <span className="text-xs text-gray-500">{member.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(member.email)}
                          className="ml-2 text-gray-400 hover:text-red-500"
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
