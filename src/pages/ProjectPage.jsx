import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks, updateTaskOrder } from "../redux/taskSlice";
import KanbanBoard from "../components/KanbanBoard";
import { toast } from "react-toastify";
import { Search, Filter, X, Calendar, User as UserIcon } from "lucide-react";

export default function ProjectPage() {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { list, loading } = useSelector((state) => state.tasks);
  const dispatch = useDispatch();
  const [localTasks, setLocalTasks] = useState([]);
  
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterDueDate, setFilterDueDate] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks({ projectId: id, token }));
  }, [dispatch, id, token]);

  
  const uniqueAssignees = useMemo(() => {
    const assignees = list
      .filter(task => task.assignee)
      .map(task => ({
        id: task.assignee._id,
        name: task.assignee.name
      }));
    return Array.from(new Map(assignees.map(a => [a.id, a])).values());
  }, [list]);

  
  const filteredTasks = useMemo(() => {
    let filtered = [...list];

  
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    
    if (filterStatus !== "all") {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    
    if (filterAssignee !== "all") {
      filtered = filtered.filter(task => task.assignee?._id === filterAssignee);
    }

    
    if (filterDueDate !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return filterDueDate === "no-date";
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        switch (filterDueDate) {
          case "overdue":
            return dueDate < today;
          case "today":
            return dueDate.getTime() === today.getTime();
          case "week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return dueDate >= today && dueDate <= weekFromNow;
          case "no-date":
            return false;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [list, searchTerm, filterStatus, filterAssignee, filterDueDate]);

  useEffect(() => {
    setLocalTasks(filteredTasks);
  }, [filteredTasks]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    
    const updatedTasks = localTasks.map(task => ({ ...task }));
    const movedTaskIndex = updatedTasks.findIndex(t => t._id === draggableId);
    
    if (movedTaskIndex === -1) return;

  
    const newStatus = destination.droppableId;
    updatedTasks[movedTaskIndex] = {
      ...updatedTasks[movedTaskIndex],
      status: newStatus
    };

  
    setLocalTasks(updatedTasks);

    
    const destColumnTasks = updatedTasks
      .filter(t => t.status === newStatus)
      .map((task, index) => ({
        _id: task._id,
        status: task.status,
        order: index
      }));

    
    dispatch(updateTaskOrder({ tasks: destColumnTasks, token }))
      .unwrap()
      .then(() => {
        toast.success("Task moved successfully");
      })
      .catch((error) => {
        
        setLocalTasks(list);
        toast.error(error || "Failed to update task order");
      });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterAssignee("all");
    setFilterDueDate("all");
  };

  const activeFiltersCount = [
    searchTerm,
    filterStatus !== "all",
    filterAssignee !== "all",
    filterDueDate !== "all"
  ].filter(Boolean).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
     
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Project Tasks Board</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {activeFiltersCount > 0 && ` (filtered from ${list.length})`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Assignee
                </label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Assignees</option>
                  {uniqueAssignees.map(assignee => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </option>
                  ))}
                </select>
              </div>

             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Due Date
                </label>
                <select
                  value={filterDueDate}
                  onChange={(e) => setFilterDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="week">Due This Week</option>
                  <option value="no-date">No Due Date</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      
      <div className="flex-1 overflow-auto px-3 sm:px-6 py-3 sm:py-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">No tasks found</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <KanbanBoard tasks={localTasks} onDragEnd={handleDragEnd} />
        )}
      </div>
    </div>
  );
}
