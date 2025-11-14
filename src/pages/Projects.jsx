import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, createProject, updateProject, deleteProject } from '../redux/projectSlice';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import Loader from '../components/Loader';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Projects() {
  const { token, user } = useSelector((state) => state.auth);
  const { list, loading, creating, pagination } = useSelector((state) => state.projects);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    if (token) {
      dispatch(fetchProjects({ token, page: currentPage }));
    }
  }, [dispatch, token, currentPage]);

  useEffect(() => {
    if (pagination.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await dispatch(createProject({
        data: projectData,
        token 
      })).unwrap();
      
      await dispatch(fetchProjects({ token, page: currentPage }));
      
      toast.success('Project created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error(error || 'Failed to create project');
    }
  };

  const handleUpdateProject = async (projectData) => {
    if (!selectedProject) return;
    
    try {
      await dispatch(updateProject({
        projectId: selectedProject._id,
        data: projectData,
        token
      })).unwrap();
      toast.success('Project updated successfully');
      setIsEditModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      toast.error(error || 'Failed to update project');
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      await dispatch(deleteProject({
        projectId: projectToDelete._id,
        token
      })).unwrap();
      
      toast.success('Project deleted successfully');
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      toast.error(error || 'Failed to delete project');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isOwner ? 'Projects' : 'Assigned Projects'}
          </h1>
        </div>
        
        {isOwner && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            Create Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {isOwner 
              ? "You don't have any projects yet" 
              : "You're not assigned to any projects yet"}
          </h3>
          {isOwner && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {list.map((project) => (
              <ProjectCard 
                key={project._id} 
                project={project} 
                isOwner={isOwner}
                onEdit={handleEditProject}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
          
          
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 space-y-4 sm:space-y-0 bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600">
                Showing page {currentPage} of {pagination.pages}
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border ${
                          currentPage === pageNum
                            ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={currentPage >= pagination.pages}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                {pagination.total} total projects
              </div>
            </div>
          )}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => !creating && setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={creating}
      />
      
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
        project={selectedProject}
        loading={creating}
      />

      
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
