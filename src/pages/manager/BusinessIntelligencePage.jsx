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
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import NavBarManager from './NavBarManager';

function BusinessIntelligencePage() {
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    processTrends: [],
    moldStats: {},
    toolStats: {},
    operatorPerformance: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  // Dummy data generator
  const generateDummyData = (period) => {
    return {
      summary: {
        totalProcesses: 1247,
        processGrowth: 12.5,
        activeMolds: 89,
        moldGrowth: 8.3,
        toolsInUse: 156,
        toolGrowth: -2.1,
        activeOperators: 24,
        operatorGrowth: 5.7
      },
      processTrends: [
        { date: '2025-01-01', completed: 45, duration: 3.2 },
        { date: '2025-01-02', completed: 52, duration: 3.1 },
        { date: '2025-01-03', completed: 48, duration: 3.4 },
        { date: '2025-01-04', completed: 61, duration: 2.9 },
        { date: '2025-01-05', completed: 55, duration: 3.0 },
        { date: '2025-01-06', completed: 58, duration: 2.8 },
        { date: '2025-01-07', completed: 63, duration: 2.7 }
      ],
      moldStats: {
        totalMolds: 89,
        activeMolds: 67,
        inactiveMolds: 22,
        utilizationRate: 75.3
      },
      toolStats: {
        totalTools: 156,
        inUse: 134,
        maintenance: 12,
        available: 10
      },
      operatorPerformance: [
        { name: 'John Smith', completedProcesses: 145, efficiency: 98.2, role: 'Senior Operator' },
        { name: 'Sarah Johnson', completedProcesses: 132, efficiency: 95.8, role: 'Machine Operator' },
        { name: 'Mike Wilson', completedProcesses: 128, efficiency: 94.5, role: 'Machine Operator' },
        { name: 'Emily Davis', completedProcesses: 121, efficiency: 92.1, role: 'Junior Operator' },
        { name: 'Robert Brown', completedProcesses: 118, efficiency: 91.7, role: 'Machine Operator' },
        { name: 'Lisa Anderson', completedProcesses: 115, efficiency: 90.3, role: 'Junior Operator' },
        { name: 'David Miller', completedProcesses: 109, efficiency: 89.8, role: 'Machine Operator' }
      ],
      recentActivity: [
        { id: 1, action: 'Process completed for Mold M001', time: '2 minutes ago', type: 'success' },
        { id: 2, action: 'Tool T045 acknowledged by Manager', time: '5 minutes ago', type: 'info' },
        { id: 3, action: 'New process started on Machine-02', time: '8 minutes ago', type: 'info' },
        { id: 4, action: 'Mold M023 status updated to completed', time: '12 minutes ago', type: 'success' },
        { id: 5, action: 'Operator John Smith logged in', time: '15 minutes ago', type: 'info' },
        { id: 6, action: 'Process M019 requires attention', time: '18 minutes ago', type: 'warning' }
      ]
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyData = generateDummyData(selectedPeriod);
      setDashboardData(dummyData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`bg-${color}-100 rounded-full p-3`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <>
        <NavBarManager />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBarManager />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Intelligence</h1>
                <p className="text-gray-600">Comprehensive analytics and insights for informed decision making</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Period Selector */}
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                
                {/* Refresh Button */}
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
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Processes"
              value={dashboardData.summary.totalProcesses || 0}
              change={dashboardData.summary.processGrowth}
              icon={Activity}
              color="blue"
            />
            <StatCard
              title="Active Molds"
              value={dashboardData.summary.activeMolds || 0}
              change={dashboardData.summary.moldGrowth}
              icon={Settings}
              color="green"
            />
            <StatCard
              title="Tools in Use"
              value={dashboardData.summary.toolsInUse || 0}
              change={dashboardData.summary.toolGrowth}
              icon={Wrench}
              color="purple"
            />
            <StatCard
              title="Active Operators"
              value={dashboardData.summary.activeOperators || 0}
              change={dashboardData.summary.operatorGrowth}
              icon={Users}
              color="orange"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mold Utilization</h3>
                <PieChart className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{dashboardData.moldStats?.activeMolds || 67}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <span className="font-medium text-gray-600">{dashboardData.moldStats?.inactiveMolds || 22}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Utilization Rate</span>
                    <span className="font-bold text-blue-600">{dashboardData.moldStats?.utilizationRate || 75.3}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tool Status</h3>
                <Wrench className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Use</span>
                  <span className="font-medium text-green-600">{dashboardData.toolStats?.inUse || 134}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Maintenance</span>
                  <span className="font-medium text-yellow-600">{dashboardData.toolStats?.maintenance || 12}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-medium text-blue-600">{dashboardData.toolStats?.available || 10}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Process Trends</h3>
                <LineChart className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Duration</span>
                  <span className="font-medium text-blue-600">3.0h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Average</span>
                  <span className="font-medium text-purple-600">55 processes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Operators */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Operators</h3>
              <div className="space-y-3">
                {dashboardData.operatorPerformance.slice(0, 5).map((operator, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{operator.name}</p>
                        <p className="text-sm text-gray-500">{operator.completedProcesses} processes • {operator.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{operator.efficiency}%</p>
                      <p className="text-sm text-gray-500">efficiency</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {dashboardData.recentActivity?.map((activity) => (
                  <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Process Trends Chart Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Process Trends</h3>
                <BarChart className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex flex-col items-center justify-center">
                <BarChart className="w-12 h-12 text-blue-400 mb-2" />
                <p className="text-gray-600 text-center">Process trends visualization</p>
                <p className="text-sm text-gray-500">Chart implementation pending</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Machine Utilization</h3>
                <PieChart className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex flex-col items-center justify-center">
                <PieChart className="w-12 h-12 text-green-400 mb-2" />
                <p className="text-gray-600 text-center">Machine utilization breakdown</p>
                <p className="text-sm text-gray-500">Chart implementation pending</p>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
                <p className="text-gray-600">Download detailed reports for further analysis</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Process Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Analytics Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BusinessIntelligencePage;