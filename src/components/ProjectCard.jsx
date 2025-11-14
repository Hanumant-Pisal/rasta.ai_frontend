import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { useDispatch, useSelector } from "react-redux";
import { addMember } from "../redux/projectSlice";
import { fetchAllMembers } from "../redux/teamSlice";
import TaskModal from "./TaskModal";
import { UserPlus, X, MoreVertical, Edit, Trash2 } from "lucide-react";

export default function ProjectCard({ project, isOwner, onEdit, onDelete }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { members: availableMembers, loading: membersLoading } = useSelector((state) => state.team);
  const [showActions, setShowActions] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const memberCount = project.members?.length || 0;
  const taskCount = project.taskCount || 0;

  useEffect(() => {
    if (showAddMember) {
      dispatch(fetchAllMembers());
    }
  }, [showAddMember, dispatch]);

  const handleCardClick = (e) => {
    // Only navigate if the click is not on the action buttons or member controls
    if (!e.target.closest('.action-button') && !e.target.closest('.add-member-container')) {
      navigate(`/project/${project._id}`);
    }
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    if (action === 'edit' && typeof onEdit === 'function') {
      onEdit(project);
    } else if (action === 'delete' && typeof onDelete === 'function') {
      onDelete(project);
    }
    setShowActions(false);
  };

  const handleAddMember = async (e) => {
    e.stopPropagation();
    if (!selectedMember) return;
    
    const memberToAdd = availableMembers.find(m => m._id === selectedMember);
    if (!memberToAdd) return;
    
    setIsAdding(true);
    setError(null);
    
    try {
      await dispatch(addMember({
        projectId: project._id,
        memberEmail: memberToAdd.email,
        token
      })).unwrap();
      
      setSelectedMember("");
      setShowAddMember(false);
    } catch (err) {
      setError(err.message || "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100"
    >
      {/* Task Creation Modal */}
      <TaskModal 
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={project._id}
      />
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg text-gray-800">{project.name}</h2>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>
        
        {isOwner && (
        <div className="flex space-x-2">
          <div className="relative add-member-container">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowAddMember(!showAddMember);
                if (showActions) setShowActions(false);
              }}
              className="action-button p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              aria-label="Add member"
            >
              <UserPlus size={18} />
            </button>

            {showAddMember && (
              <div 
                className="absolute right-0 mt-2 w-64 p-3 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Add Team Member</h4>
                  <button 
                    onClick={() => setShowAddMember(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    disabled={membersLoading}
                  >
                    <option value="">Select a member...</option>
                    {availableMembers
                      .filter(member => !project.members?.some(m => 
                        (typeof m === 'object' ? m.email : m) === member.email
                      ))
                      .map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                  </select>
                  
                  {membersLoading && (
                    <p className="text-xs text-gray-500">Loading members...</p>
                  )}
                  
                  <button
                    onClick={handleAddMember}
                    disabled={isAdding || !selectedMember || membersLoading}
                    className="w-full flex items-center justify-center px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding ? 'Adding...' : (
                      <>
                        <UserPlus size={14} className="mr-1" />
                        Add Member
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p className="mt-2 text-xs text-red-500">{error}</p>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
                if (showAddMember) setShowAddMember(false);
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>

            {showActions && (
              <div 
                className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleActionClick(e, 'edit')}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit size={14} className="mr-2" /> Edit Project
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={(e) => handleActionClick(e, 'delete')}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <Trash2 size={14} className="mr-2" /> Delete Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
            </span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTaskModal(true);
            }}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md transition-colors"
          >
            + Add Task
          </button>
        </div>
        {project.updatedAt && (
          <div className="mt-2 text-xs text-gray-400">
            Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
}
