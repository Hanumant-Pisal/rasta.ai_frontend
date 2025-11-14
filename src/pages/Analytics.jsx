import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../redux/projectSlice';
import { fetchAllTasks } from '../redux/taskSlice';
import { fetchAllMembers } from '../redux/teamSlice';
import { setUser } from '../redux/authSlice';
import { Users, FolderKanban, CheckCircle, ArrowUp, ClipboardList } from 'lucide-react';
import Loader from '../components/Loader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';


const StatsCard = ({ title, value, icon: Icon, trend, trendText, className = '' }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center mt-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <ArrowUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'transform rotate-180' : ''}`} />
            {trend}%
          </span>
          <span className="text-xs text-gray-500 ml-2">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${
        title === 'Total Project' ? 'bg-blue-50' :
        title === 'Total Members' ? 'bg-purple-50' :
        title === 'Total Tasks' ? 'bg-green-50' : 'bg-orange-50'
      }`}>
        <Icon className={`h-6 w-6 ${
          title === 'Total Project' ? 'text-blue-600' :
          title === 'Total Members' ? 'text-purple-600' :
          title === 'Total Tasks' ? 'text-green-600' : 'text-orange-600'
        }`} />
      </div>
    </div>
  </div>
);


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const Analytics = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const { list: projects = [], loading: projectsLoading } = useSelector(state => state.projects);
  const { list: tasks = [], loading: tasksLoading } = useSelector(state => state.tasks);
  const { members = [], loading: membersLoading } = useSelector(state => state.team);
  const { token, user } = useSelector(state => state.auth);
  
 
  const stats = React.useMemo(() => ({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'Done').length,
    inProgressTasks: tasks.filter(task => task.status === 'In Progress').length,
    totalMembers: members.length
  }), [projects, tasks, members]);

  
  const projectTaskCounts = React.useMemo(() => {
    const counts = {};
    tasks.forEach(task => {
      const projectName = projects.find(p => p._id === task.projectId)?.name || 'Unknown';
      counts[projectName] = (counts[projectName] || 0) + 1;
    });
    return counts;
  }, [tasks, projects]);

  
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        
        if (!token) {
          
          const storedUser = JSON.parse(localStorage.getItem('user')) || {};
          const storedToken = storedUser?.token || localStorage.getItem('token');
          
          if (!storedToken) {
            throw new Error('Authentication required. Please log in again.');
          }
          
          
          dispatch(setUser({ ...storedUser, token: storedToken }));
          return; 
        }
        
        
        await Promise.all([
          dispatch(fetchProjects({ token })),
          dispatch(fetchAllTasks(token)),
          user?.role === 'owner' && dispatch(fetchAllMembers())
        ].filter(Boolean)); 
        
      } catch (error) {
        setError(error.message || 'Failed to load analytics data. Please try again.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    
    return () => {
      isMounted = false;
    };
  }, [dispatch, token, user?.role]);
  
 
  if (isLoading || projectsLoading || tasksLoading || membersLoading) {
    return <Loader text="Loading analytics data..." className="h-64" />;
  }
  
 
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none"
              >
                Try Again <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  
  const taskStatusData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [
          tasks.filter(t => t.status === 'To Do').length,
          tasks.filter(t => t.status === 'In Progress').length,
          tasks.filter(t => t.status === 'Done').length
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)', 
          'rgba(59, 130, 246, 0.8)',  
          'rgba(34, 197, 94, 0.8)'    
        ],
        borderColor: [
          'rgba(156, 163, 175, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const taskStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Task Status Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} tasks (${percentage}%)`;
          }
        }
      }
    },
  };

  const projectTaskData = {
    labels: Object.keys(projectTaskCounts).slice(0, 6), 
    datasets: [
      {
        label: 'Tasks per Project',
        data: Object.values(projectTaskCounts).slice(0, 6),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const projectTaskOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Tasks by Project',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} tasks`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false,
        },
      },
    },
  };

  
  const pieChartData = {
    labels: ['Projects', 'Tasks', 'Team Members'],
    datasets: [
      {
        data: [stats.totalProjects, stats.totalTasks, stats.totalMembers],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Project, Task & Team Distribution',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="max-w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Project"
          value={stats.totalProjects}
          icon={FolderKanban}
          trend={8.2}
          trendText="vs last month"
        />
        {user?.role === 'owner' ? (
          <StatsCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            trend={5.7}
            trendText="vs last month"
            className="bg-purple-50"
            iconColor="text-purple-600"
          />
        ) : (
          <StatsCard
            title="Tasks Pending"
            value={stats.totalTasks - stats.completedTasks}
            icon={ClipboardList}
            trend={-3.2}
            trendText="vs last month"
            className="bg-amber-50"
            iconColor="text-amber-600"
          />
        )}
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckCircle}
          trend={12.4}
          trendText="vs last month"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`}
          icon={CheckCircle}
          trend={5.2}
          trendText="vs last month"
          className="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 max-w-full">
       
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={taskStatusData} options={taskStatusOptions} />
          </div>
        </div>
        
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="h-80">
            <Bar data={projectTaskData} options={projectTaskOptions} />
          </div>
        </div>

       
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="h-80 flex items-center justify-center">
            <Pie data={pieChartData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
