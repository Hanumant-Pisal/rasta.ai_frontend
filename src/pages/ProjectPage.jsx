import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks, updateTaskOrder } from "../redux/taskSlice";
import KanbanBoard from "../components/KanbanBoard";
import { toast } from "react-toastify";

export default function ProjectPage() {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { list, loading } = useSelector((state) => state.tasks);
  const dispatch = useDispatch();
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    dispatch(fetchTasks({ projectId: id, token }));
  }, [dispatch, id, token]);

  useEffect(() => {
    setLocalTasks(list);
  }, [list]);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Tasks Board</h1>
      {loading && <p className="text-gray-500 mb-4">Loading tasks...</p>}
      <KanbanBoard tasks={localTasks} onDragEnd={handleDragEnd} />
    </div>
  );
}
