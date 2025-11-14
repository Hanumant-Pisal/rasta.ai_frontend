import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProjects, createProject } from "../redux/projectSlice";
import { fetchUserInfo } from "../redux/authSlice";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import Loader from "../components/Loader";
import DashboardLayout from "../components/DashboardLayout";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Dashboard() {
  const { token, user } = useSelector((state) => state.auth);
  const { 
    list, 
    loading, 
    creating, 
    pagination 
  } = useSelector((state) => state.projects);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOwner = user?.role === 'owner';
  
  
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);
  const { pages, total } = pagination;

  useEffect(() => {
    if (token) {
      dispatch(fetchProjects({ token, page: currentPage }));
      if (!user) {
        dispatch(fetchUserInfo());
      }
    }
  }, [dispatch, token, currentPage]);

  useEffect(() => {
    if (pagination.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
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
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <DashboardLayout>
      
      
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => !creating && setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={creating}
      />
    </DashboardLayout>
  );
}
