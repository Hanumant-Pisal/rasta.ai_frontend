import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

export default function KanbanBoard({ tasks = [], onDragEnd }) {
  const columns = ["To Do", "In Progress", "Done"];
  
  // Ensure tasks is an array and has items
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {columns.map((col) => {
          // Filter tasks for this column
          const columnTasks = safeTasks.filter(
            (task) => task && task.status === col
          );

          return (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-50 p-3 rounded-lg min-h-[400px]"
                >
                  <h2 className="font-semibold mb-2">{col} ({columnTasks.length})</h2>
                  {columnTasks.map((task, index) => (
                    <Draggable 
                      key={task?._id || index} 
                      draggableId={task?._id || `task-${index}`} 
                      index={index}
                    >
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2"
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
