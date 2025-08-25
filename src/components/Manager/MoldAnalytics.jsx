import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Settings,
  Wrench,
  RefreshCw,
  Download
} from 'lucide-react';
import axios from 'axios';
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
  ArcElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MoldAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate year options (current year and past 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.get(`http://localhost:8080/api/mold/analytics/${selectedYear}`, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      
      setAnalyticsData(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, percentage }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 text-${color}-600`} />
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {percentage && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className={`bg-${color}-100 rounded-full p-3 ml-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  // Chart data preparation functions
  const getCategoryLineChartData = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      labels: months,
      datasets: [
        {
          label: 'New Molds',
          data: months.map(() => Math.floor(Math.random() * 10) + data.newMolds / 12),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Renovate Molds',
          data: months.map(() => Math.floor(Math.random() * 8) + data.renovateMolds / 12),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Modify Molds',
          data: months.map(() => Math.floor(Math.random() * 6) + data.modifyMolds / 12),
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getDeliveryPieChartData = (data) => {
    return {
      labels: ['On Time', 'Delayed'],
      datasets: [
        {
          data: [data.totalOnTime, data.totalDelayed],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getCategoryPerformanceBarData = (data) => {
    const categories = Object.keys(data.byCategory);
    const onTimeData = categories.map(cat => data.byCategory[cat].onTime);
    const delayedData = categories.map(cat => data.byCategory[cat].delayed);

    return {
      labels: categories,
      datasets: [
        {
          label: 'On Time',
          data: onTimeData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Delayed',
          data: delayedData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getMachinePerformanceBarData = (data) => {
    const machines = Object.keys(data.byMachine);
    const onTimeData = machines.map(machine => data.byMachine[machine].onTime);
    const delayedData = machines.map(machine => data.byMachine[machine].delayed);

    return {
      labels: machines,
      datasets: [
        {
          label: 'On Time',
          data: onTimeData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Delayed',
          data: delayedData,
          backgroundColor: 'rgba(249, 115, 22, 0.8)',
          borderColor: 'rgb(249, 115, 22)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const CategoryBreakdownCard = ({ data }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Mold Category Trends
        </h3>
        <span className="text-sm text-gray-500">{selectedYear}</span>
      </div>
      
      {/* Line Chart */}
      <div className="h-64 mb-6">
        <Line data={getCategoryLineChartData(data)} options={chartOptions} />
      </div>

      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{data.newMolds}</p>
            <p className="text-sm text-gray-600">New Molds</p>
            <p className="text-xs text-gray-500">
              {calculatePercentage(data.newMolds, analyticsData.totalMolds)}% of total
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{data.renovateMolds}</p>
            <p className="text-sm text-gray-600">Renovate Molds</p>
            <p className="text-xs text-gray-500">
              {calculatePercentage(data.renovateMolds, analyticsData.totalMolds)}% of total
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{data.modifyMolds}</p>
            <p className="text-sm text-gray-600">Modify Molds</p>
            <p className="text-xs text-gray-500">
              {calculatePercentage(data.modifyMolds, analyticsData.totalMolds)}% of total
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const DeliveryPerformanceCard = ({ data }) => {
    const total = data.totalOnTime + data.totalDelayed;
    const onTimePercentage = calculatePercentage(data.totalOnTime, total);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Delivery Performance Overview
          </h3>
          <span className="text-sm text-gray-500">{selectedYear}</span>
        </div>

        {/* Pie Chart */}
        <div className="h-64 mb-6">
          <Pie data={getDeliveryPieChartData(data)} options={pieChartOptions} />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{data.totalOnTime}</p>
            <p className="text-sm text-gray-600">On Time ({onTimePercentage}%)</p>
          </div>
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{data.totalDelayed}</p>
            <p className="text-sm text-gray-600">Delayed ({(100 - onTimePercentage).toFixed(1)}%)</p>
          </div>
        </div>
      </div>
    );
  };

  const CategoryPerformanceCard = ({ data }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Performance by Category
        </h3>
        <span className="text-sm text-gray-500">{selectedYear}</span>
      </div>

      {/* Bar Chart */}
      <div className="h-64 mb-6">
        <Bar data={getCategoryPerformanceBarData(data)} options={chartOptions} />
      </div>

      {/* Detailed Stats */}
      <div className="space-y-3">
        {Object.entries(data.byCategory).map(([category, stats]) => {
          const categoryTotal = stats.onTime + stats.delayed;
          const categoryOnTimePercentage = calculatePercentage(stats.onTime, categoryTotal);
          
          return (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{category}</span>
                <span className="text-sm text-green-600">{categoryOnTimePercentage}% On Time</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  {stats.onTime} On Time
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.delayed} Delayed
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${categoryOnTimePercentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MachinePerformanceCard = ({ data }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          Machine Performance Analysis
        </h3>
        <span className="text-sm text-gray-500">{selectedYear}</span>
      </div>

      {/* Bar Chart */}
      <div className="h-64 mb-6">
        <Bar data={getMachinePerformanceBarData(data)} options={chartOptions} />
      </div>

      {/* Detailed Machine Stats */}
      <div className="space-y-4">
        {Object.entries(data.byMachine).map(([machine, stats]) => {
          const total = stats.onTime + stats.delayed;
          const onTimePercentage = calculatePercentage(stats.onTime, total);
          const efficiency = onTimePercentage;
          
          return (
            <div key={machine} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{machine}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{total}</span>
                  <span className="text-sm text-gray-500 ml-1">total</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                <div className="text-center p-2 bg-green-100 rounded">
                  <p className="font-bold text-green-600">{stats.onTime}</p>
                  <p className="text-gray-600">On Time</p>
                </div>
                <div className="text-center p-2 bg-red-100 rounded">
                  <p className="font-bold text-red-600">{stats.delayed}</p>
                  <p className="text-gray-600">Delayed</p>
                </div>
                <div className="text-center p-2 bg-blue-100 rounded">
                  <p className="font-bold text-blue-600">{efficiency}%</p>
                  <p className="text-gray-600">Efficiency</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    efficiency >= 90 ? 'bg-green-600' : 
                    efficiency >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(efficiency, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

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
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Analytics</h3>
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

  if (!analyticsData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <Calendar className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Data Available</h3>
        <p className="text-yellow-700">No analytics data found for {selectedYear}</p>
      </div>
    );
  }

  const totalMolds = analyticsData.totalMolds;
  const onTimePercentage = calculatePercentage(
    analyticsData.deliveryPerformance.totalOnTime, 
    analyticsData.deliveryPerformance.totalOnTime + analyticsData.deliveryPerformance.totalDelayed
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mold Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive analytics for {selectedYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Molds Manufactured"
          value={totalMolds}
          subtitle={`Completed in ${selectedYear}`}
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="On-Time Delivery Rate"
          value={`${onTimePercentage}%`}
          subtitle={`${analyticsData.deliveryPerformance.totalOnTime} of ${analyticsData.deliveryPerformance.totalOnTime + analyticsData.deliveryPerformance.totalDelayed} molds`}
          icon={CheckCircle}
          color="green"
          percentage={onTimePercentage}
        />
        <StatCard
          title="New Molds"
          value={analyticsData.categoryBreakdown.newMolds}
          subtitle={`${calculatePercentage(analyticsData.categoryBreakdown.newMolds, totalMolds)}% of total`}
          icon={Settings}
          color="purple"
          percentage={calculatePercentage(analyticsData.categoryBreakdown.newMolds, totalMolds)}
        />
        <StatCard
          title="Machine Utilization"
          value={Object.keys(analyticsData.machinePerformance.byMachine).length}
          subtitle="Active machines"
          icon={Wrench}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownCard data={analyticsData.categoryBreakdown} />
        <DeliveryPerformanceCard data={analyticsData.deliveryPerformance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPerformanceCard data={analyticsData.deliveryPerformance} />
        <MachinePerformanceCard data={analyticsData.machinePerformance} />
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Analytics Reports</h3>
            <p className="text-gray-600">Download detailed reports for {selectedYear}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Category Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Delivery Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Full Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoldAnalytics;