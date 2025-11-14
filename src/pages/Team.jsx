import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMembers, deleteMember } from '../redux/teamSlice';
import { Users, UserPlus, Mail, Phone, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader';

const Team = () => {
  const dispatch = useDispatch();
  const { members, loading, error } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);
  
  const handleDelete = (memberId, memberName) => {
    if (!memberId) {
      toast.error('Error: No member ID provided');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      dispatch(deleteMember(memberId))
        .unwrap()
        .then(() => {
          toast.success('Team member removed successfully');
        })
        .catch((error) => {
          toast.error(error || 'Failed to remove team member');
        });
    }
  };

  useEffect(() => {
    dispatch(fetchAllMembers());
  }, [dispatch]);

  if (loading) {
    return <Loader text="Loading team members..." className="h-64" />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
       
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        {member.phone && (
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.role === 'owner' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role || 'member'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate max-w-xs">{member.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(member._id, member.name)}
                      disabled={user?.role !== 'owner' || user?._id === member._id}
                      className={`flex items-center text-red-600 hover:text-red-900 ${
                        (user?.role !== 'owner' || user?._id === member._id) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={user?._id === member._id ? "You can't delete yourself" : "Delete member"}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 bg-white">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No team members found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new team member.</p>
            <div className="mt-6">
           
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
