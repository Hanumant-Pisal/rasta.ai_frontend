import { format } from 'date-fns';
import { Clock, User, Flag, MoreVertical } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function TaskCard({ task }) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            {task.priority && (
              <Badge variant="outline" className={`text-xs ${priorityColors[task.priority] || 'bg-gray-100'}`}>
                {task.priority}
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {task.assignee ? (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{task.assignee.name || 'Unassigned'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <User className="h-3.5 w-3.5" />
                <span>Unassigned</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${statusColors[task.status] || 'bg-gray-100'}`}>
            {task.status}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
