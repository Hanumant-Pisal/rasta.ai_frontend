import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { Circle, Clock, CheckCircle2 } from "lucide-react";

export default function KanbanBoard({ tasks = [], onDragEnd }) {
  const columns = [
    { 
      id: "To Do", 
      title: "To Do", 
      icon: Circle,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-300"
    },
    { 
      id: "In Progress", 
      title: "In Progress", 
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300"
    },
    { 
      id: "Done", 
      title: "Done", 
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300"
    }
  ];
  
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = safeTasks.filter(
            (task) => task && task.status === column.id
          );
          const Icon = column.icon;

          return (
            <div key={column.id} className="flex flex-col">
             
              <div className={`${column.bgColor} rounded-t-xl border-t-4 ${column.borderColor} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${column.color}`} />
                    <h2 className={`font-semibold ${column.color} text-lg`}>
                      {column.title}
                    </h2>
                  </div>
                  <span className={`${column.color} font-medium text-sm px-2.5 py-0.5 rounded-full ${column.bgColor} border ${column.borderColor}`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

            
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-white rounded-b-xl border-x border-b ${column.borderColor} p-3 min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? column.bgColor : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {columnTasks.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                          No tasks
                        </div>
                      ) : (
                        columnTasks.map((task, index) => (
                          <Draggable 
                            key={task?._id || index} 
                            draggableId={task?._id || `task-${index}`} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-transform ${
                                  snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                }`}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
