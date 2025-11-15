import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Clock, User, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Badge } from './ui/badge';
import { deleteTask } from '../redux/taskSlice';
import { toast } from 'react-toastify';
import EditTaskModal from './EditTaskModal';
import axios from 'axios';

export default function TaskCard({ task }) {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  
  // Fetch comment count
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comments/task/${task._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommentCount(response.data.comments?.length || 0);
      } catch (error) {
        // Silently fail - comment count is not critical
      }
    };
    
    if (task._id && token) {
      fetchCommentCount();
    }
  }, [task._id, token, isEditModalOpen]); // Refresh when modal closes
  
  const statusColors = {
    'To Do': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Done': 'bg-green-100 text-green-800',
  };

  const priorityColors = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-gray-100 text-gray-800',
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteTask({ taskId: task._id, token })).unwrap();
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group">
      {/* Title and Priority */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>
        {task.priority && (
          <Badge variant="outline" className={`text-xs font-medium ${priorityColors[task.priority] || 'bg-gray-100'} shrink-0`}>
            {task.priority}
          </Badge>
        )}
      </div>
      
      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}
      
      {/* Comment Count Badge */}
      {commentCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
        </div>
      )}
      
      {/* Footer with metadata */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex flex-col gap-2 flex-1">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
              {isOverdue && <span className="text-red-600 font-semibold">• Overdue</span>}
            </div>
          )}
          
          {/* Assignee */}
          <div className="flex items-center gap-1.5 text-xs">
            {task.assignee ? (
              <>
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">{task.assignee.name}</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <span className="text-gray-400">Unassigned</span>
              </>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
            title="Edit task"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
