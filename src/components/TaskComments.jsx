import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, user } = useSelector((state) => state.auth);

  const API_URL = 'http://localhost:5000/api/comments';


  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/task/${taskId}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  
  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const response = await axios.put(
        `${API_URL}/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(
        comments.map((c) =>
          c._id === commentId ? response.data.comment : c
        )
      );
      setEditingId(null);
      setEditContent('');
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

 
  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await axios.delete(`${API_URL}/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="w-5 h-5" />
        <span>Comments ({comments.length})</span>
      </div>

    
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-gray-50 rounded-lg p-4 space-y-2"
            >
          
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold text-sm">
                    {comment.userId?.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                    {comment.isEdited && ' (edited)'}
                  </span>
                </div>

               
                {user?.id?.toString() === comment.userId?._id?.toString() && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditContent(comment.content);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

             
              {editingId === comment._id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(comment._id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-gray-700 text-sm">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
