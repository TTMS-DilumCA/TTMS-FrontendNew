import React, { useState, useEffect } from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Wrench,
  Settings,
  Activity,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Factory,
  UserCheck,
  Target
} from 'lucide-react';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api'; 


const SystemOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    molds: null,
    customers: null,
    processes: null,
    tools: null,
    workforce: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const refreshToken = localStorage.getItem('refreshToken');
     
      
      const headers = {
        Authorization: `Bearer ${refreshToken}`,
      };

      // Fetch all overview data in parallel
   const [moldsRes, customersRes, processesRes, toolsRes, workforceRes] = await Promise.all([
        axios.get(buildApiUrl(API_ENDPOINTS.SYSTEM_OVERVIEW.MOLDS(selectedPeriod)), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.SYSTEM_OVERVIEW.CUSTOMERS(selectedPeriod)), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.SYSTEM_OVERVIEW.PROCESSES(selectedPeriod)), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.SYSTEM_OVERVIEW.TOOLS(selectedPeriod)), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.SYSTEM_OVERVIEW.WORKFORCE(selectedPeriod)), { headers })
      ]);

      setDashboardData({
        molds: moldsRes.data,
        customers: customersRes.data,
        processes: processesRes.data,
        tools: toolsRes.data,
        workforce: workforceRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`bg-${color}-100 rounded-full p-3 ml-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const formatDuration = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateTotalProcesses = () => {
    if (!dashboardData.processes?.statusDistribution) return 0;
    return Object.values(dashboardData.processes.statusDistribution).reduce((sum, count) => sum + count, 0);
  };

  const calculateOngoingProcesses = () => {
    return dashboardData.processes?.statusDistribution?.ongoing || 0;
  };

  const calculateCompletedProcesses = () => {
    return dashboardData.processes?.statusDistribution?.completed || 0;
  };

  const calculateTotalTools = () => {
    if (!dashboardData.tools?.statusDistribution) return 0;
    return Object.values(dashboardData.tools.statusDistribution).reduce((sum, count) => sum + count, 0);
  };

  const getTopOperators = () => {
    if (!dashboardData.workforce?.operatorEfficiency) return [];
    return Object.entries(dashboardData.workforce.operatorEfficiency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, efficiency], index) => ({
        rank: index + 1,
        name,
        efficiency: Math.round(efficiency * 100),
        completedProcesses: Math.floor(Math.random() * 20) + 5 // Placeholder
      }));
  };

  const getRecentActivities = () => {
    const activities = [];
    
    if (dashboardData.processes?.statusDistribution?.completed > 0) {
      activities.push({
        id: 1,
        type: 'success',
        action: `${dashboardData.processes.statusDistribution.completed} processes completed successfully`,
        time: '2 hours ago'
      });
    }
    
    if (dashboardData.molds?.totalActiveMolds > 0) {
      activities.push({
        id: 2,
        type: 'info',
        action: `${dashboardData.molds.totalActiveMolds} molds currently active`,
        time: '4 hours ago'
      });
    }
    
    if (dashboardData.tools?.statusDistribution?.maintenance > 0) {
      activities.push({
        id: 3,
        type: 'warning',
        action: `${dashboardData.tools.statusDistribution.maintenance} tools require maintenance`,
        time: '6 hours ago'
      });
    }

    return activities;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Overview Dashboard</h2>
          <p className="text-gray-600">Comprehensive system analytics for {selectedPeriod.toLowerCase()} view</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Processes"
          value={calculateTotalProcesses()}
          subtitle={`${calculateOngoingProcesses()} ongoing, ${calculateCompletedProcesses()} completed`}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Active Molds"
          value={dashboardData.molds?.totalActiveMolds || 0}
          subtitle="Currently in production"
          icon={Settings}
          color="green"
        />
        <StatCard
          title="Total Tools"
          value={calculateTotalTools()}
          subtitle={`${dashboardData.tools?.statusDistribution?.available || 0} available`}
          icon={Wrench}
          color="purple"
        />
        <StatCard
          title="Total Employees"
          value={dashboardData.workforce?.totalEmployees || 0}
          subtitle="Active workforce"
          icon={Users}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mold Distribution */}
        <ChartCard title="Mold Categories" icon={Factory}>
          <div className="space-y-3">
            {dashboardData.molds?.categoryDistribution && Object.entries(dashboardData.molds.categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{category}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {dashboardData.molds?.averageCompletionTime && (
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Avg. Completion</span>
                  <span className="font-bold text-blue-600">
                    {formatDuration(dashboardData.molds.averageCompletionTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Tool Status */}
        <ChartCard title="Tool Status" icon={Wrench}>
          <div className="space-y-3">
            {dashboardData.tools?.statusDistribution && Object.entries(dashboardData.tools.statusDistribution).map(([status, count]) => {
              const statusColors = {
                available: 'text-green-600',
                'in-use': 'text-blue-600',
                maintenance: 'text-yellow-600',
                completed: 'text-gray-600'
              };
              return (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</span>
                  <span className={`font-medium ${statusColors[status] || 'text-gray-900'}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Process Types */}
        <ChartCard title="Process Types" icon={Activity}>
          <div className="space-y-3">
            {dashboardData.processes?.processTypeDistribution && Object.entries(dashboardData.processes.processTypeDistribution)
              .slice(0, 5)
              .map(([process, count]) => (
                <div key={process} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{process}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </ChartCard>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Operators */}
        <ChartCard title="Top Performing Operators" icon={UserCheck}>
          <div className="space-y-3">
            {getTopOperators().length > 0 ? (
              getTopOperators().map((operator) => (
                <div key={operator.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{operator.rank}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{operator.name}</p>
                      <p className="text-sm text-gray-500">{operator.completedProcesses} processes completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{operator.efficiency}%</p>
                    <p className="text-sm text-gray-500">efficiency</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p>No operator data available</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="System Activity" icon={Clock}>
          <div className="space-y-3">
            {getRecentActivities().length > 0 ? (
              getRecentActivities().map((activity) => (
                <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  activity.type === 'success' ? 'bg-green-50 border-green-200' :
                  activity.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  {activity.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                   activity.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> :
                   <Clock className="w-4 h-4 text-blue-500" />}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Detailed Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Workload */}
        <ChartCard title="Machine Workload Distribution" icon={Factory}>
          <div className="space-y-4">
            {dashboardData.molds?.machineWorkload && Object.entries(dashboardData.molds.machineWorkload).map(([machine, workload]) => {
              const maxWorkload = Math.max(...Object.values(dashboardData.molds.machineWorkload));
              const percentage = maxWorkload > 0 ? (workload / maxWorkload) * 100 : 0;
              
              return (
                <div key={machine} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{machine || 'Unassigned'}</span>
                    <span className="text-gray-600">{workload} molds</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Average Process Completion Times */}
        <ChartCard title="Process Completion Times" icon={Target}>
          <div className="space-y-4">
            {dashboardData.processes?.averageCompletionTime && Object.entries(dashboardData.processes.averageCompletionTime).map(([process, duration]) => (
              <div key={process} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{process}</p>
                  <p className="text-sm text-gray-500">Average completion</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatDuration(duration)}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Employee Distribution */}
      <ChartCard title="Workforce Distribution" icon={Users}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboardData.workforce?.employeesByRole && Object.entries(dashboardData.workforce.employeesByRole).map(([role, count]) => (
            <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{role.replace('_', ' ').toLowerCase()}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Export Section */}
   {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Export Analytics Reports</h3>
      <p className="text-gray-600">Download detailed reports for {selectedYear}</p>
    </div>
    <div>
      <h4 className="text-md font-medium text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">
        Analytics Overview {selectedYear}
      </h4>
    </div>
  </div>
</div> */}
    </div>
  );
};

export default SystemOverview;