
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore, Task, TaskStatus } from '@/stores/taskStore';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, User, Trash } from 'lucide-react';

export const TaskList: React.FC = () => {
  const { user } = useAuthStore();
  const { getTasksByOrganization, updateTask, deleteTask } = useTaskStore();
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  if (!user) return null;

  const organizationTasks = getTasksByOrganization(user.organizationId);
  const filteredTasks = statusFilter === 'all' 
    ? organizationTasks 
    : organizationTasks.filter(task => task.status === statusFilter);

  const userTasks = user.role === 'member' 
    ? filteredTasks.filter(task => task.assigneeId === user.id)
    : filteredTasks;

  const canEditTasks = user.role === 'admin' || user.role === 'manager';

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    return new Date(dueDate) < new Date() && status !== 'completed' && status !== 'expired';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {user.role === 'member' ? 'My Tasks' : 'All Tasks'}
        </h3>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | TaskStatus)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {userTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          userTasks.map((task) => (
            <Card key={task.id} className={`${isOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{task.assigneeName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                        {isOverdue(task.dueDate, task.status) && (
                          <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                      {(canEditTasks || task.assigneeId === user.id) && (
                        <Select 
                          value={task.status} 
                          onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {canEditTasks && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
