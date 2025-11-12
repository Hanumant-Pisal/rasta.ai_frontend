import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks, updateTaskStatus } from "../redux/taskSlice";
import KanbanBoard from "../components/KanbanBoard";

export default function ProjectPage() {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { list } = useSelector((state) => state.tasks);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks({ projectId: id, token }));
  }, [dispatch, id, token]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    dispatch(updateTaskStatus({ id: draggableId, status: destination.droppableId, token }));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Project Tasks</h1>
      <KanbanBoard tasks={list} onDragEnd={handleDragEnd} />
    </div>
  );
}
