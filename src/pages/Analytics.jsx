import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../redux/projectSlice';
import { fetchTasks } from '../redux/taskSlice';
import { Users, FolderKanban, CheckCircle, ArrowUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const Analytics = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const projects = useSelector(state => state.projects?.list || []);
  const tasks = useSelector(state => state.tasks?.list || []);
  

  const stats = {
    totalProjects: projects?.length || 0,
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter(task => task.status === 'Done')?.length || 0,
    inProgressTasks: tasks?.filter(task => task.status === 'In Progress')?.length || 0,
    totalMembers: 12 
  };
  
 
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem('user')) || {};
        if (user?.token) {
          
          await dispatch(fetchProjects());
          
          
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]);

  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Loading analytics data...</p>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [12, 19, 3, 5, 2, 3, 15],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Tasks In Progress',
        data: [5, 12, 8, 10, 6, 8, 10],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Completion Trend',
        font: {
          size: 16,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
      
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Project"
          value={stats.totalProjects}
          icon={FolderKanban}
          trend={8.2}
          trendText="vs last month"
        />
        <StatsCard
          title="Total Members"
          value={stats.totalMembers || 12}
          icon={Users}
          trend={5.7}
          trendText="vs last month"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckCircle}
          trend={12.4}
          trendText="vs last month"
        />
      </div>

      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
