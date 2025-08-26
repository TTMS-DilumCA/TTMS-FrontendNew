import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FileSpreadsheet, Download } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

const BIReportExcel = ({ triggerComponent = null }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateComprehensiveReport = async () => {
    setIsGenerating(true);
    
    try {
      const token = localStorage.getItem('refreshToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all necessary data
   const [moldsRes, processesRes, usersRes, customersRes] = await Promise.all([
        axios.get(buildApiUrl(API_ENDPOINTS.MOLD.SHARED), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.PROCESS.SHARED), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.MANAGER.USERS), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.CUSTOMERS.LIST), { headers })
      ]);

      const moldsData = moldsRes.data;
      const processesData = processesRes.data;
      const usersData = usersRes.data;
      const customersData = customersRes.data;

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // 1. EXECUTIVE DASHBOARD (Combines summary + key charts data)
      await createExecutiveDashboardSheet(workbook, moldsData, processesData, usersData, customersData);

      // 2. ANALYTICS DATA (Combines mold + process analytics)
      await createAnalyticsDataSheet(workbook, moldsData, processesData);

      // 3. DETAILED DATA (All raw data in one sheet)
      await createConsolidatedDataSheet(workbook, moldsData, processesData, usersData, customersData);

      // Generate and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `TTMS_BI_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, fileName);

      await Swal.fire({
        icon: 'success',
        title: 'Report Generated Successfully!',
        text: `Business intelligence report has been downloaded as ${fileName}`,
        timer: 3000,
        showConfirmButton: false
      });

      return { success: true, fileName };

    } catch (error) {
      console.error('Error generating report:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Report Generation Failed',
        text: error.response?.data?.message || 'Failed to generate the report. Please try again.',
        confirmButtonColor: '#dc2626'
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  // Create Executive Dashboard Sheet (Main KPIs + Chart Data)
  const createExecutiveDashboardSheet = (workbook, molds, processes, users, customers) => {
    const now = new Date();
    const totalMolds = molds.length;
    const completedMolds = molds.filter(m => m.status?.toLowerCase() === 'completed').length;
    const ongoingMolds = molds.filter(m => m.status?.toLowerCase() === 'ongoing').length;
    const totalProcesses = processes.length;
    const completedProcesses = processes.filter(p => p.status?.toLowerCase() === 'completed').length;

    // Status distribution for pie chart
    const statusDistribution = molds.reduce((acc, mold) => {
      const status = mold.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Monthly trends for line chart
    const monthlyTrends = molds.reduce((acc, mold) => {
      if (mold.createdDate) {
        const date = new Date(mold.createdDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {});

    // Top customers for bar chart
    const customerData = molds.reduce((acc, mold) => {
      const customer = mold.customer || 'Unknown';
      acc[customer] = (acc[customer] || 0) + 1;
      return acc;
    }, {});
    
    const topCustomers = Object.entries(customerData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const dashboardData = [
      ['TTMS BUSINESS INTELLIGENCE DASHBOARD'],
      ['Generated:', now.toLocaleDateString() + ' ' + now.toLocaleTimeString()],
      [''],
      ['═══════════════════════════════════════'],
      ['KEY PERFORMANCE INDICATORS'],
      ['═══════════════════════════════════════'],
      ['Metric', 'Value', 'Target', 'Status'],
      ['Total Molds', totalMolds, '-', '✓'],
      ['Mold Completion Rate', `${totalMolds ? ((completedMolds/totalMolds)*100).toFixed(1) : 0}%`, '85%', completedMolds/totalMolds >= 0.85 ? '✓' : '⚠'],
      ['Process Efficiency', `${totalProcesses ? ((completedProcesses/totalProcesses)*100).toFixed(1) : 0}%`, '90%', completedProcesses/totalProcesses >= 0.90 ? '✓' : '⚠'],
      ['Active Users', users.filter(u => u.status !== 'Inactive').length, users.length, '✓'],
      ['Total Customers', customers.length, '-', '✓'],
      [''],
      ['═══════════════════════════════════════'],
      ['MOLD STATUS DISTRIBUTION (Pie Chart Data)'],
      ['═══════════════════════════════════════'],
      ['Status', 'Count', 'Percentage'],
      ...Object.entries(statusDistribution).map(([status, count]) => [
        status,
        count,
        `${((count / totalMolds) * 100).toFixed(1)}%`
      ]),
      [''],
      ['═══════════════════════════════════════'],
      ['MONTHLY CREATION TRENDS (Line Chart Data)'],
      ['═══════════════════════════════════════'],
      ['Month', 'Molds Created'],
      ...Object.entries(monthlyTrends)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => [month, count]),
      [''],
      ['═══════════════════════════════════════'],
      ['TOP 5 CUSTOMERS (Bar Chart Data)'],
      ['═══════════════════════════════════════'],
      ['Customer', 'Molds Count', 'Percentage'],
      ...topCustomers.map(([customer, count]) => [
        customer,
        count,
        `${((count / totalMolds) * 100).toFixed(1)}%`
      ]),
      [''],
      ['═══════════════════════════════════════'],
      ['SYSTEM HEALTH OVERVIEW'],
      ['═══════════════════════════════════════'],
      ['Component', 'Status', 'Details'],
      ['Mold Management', totalMolds > 0 ? 'Operational' : 'Empty', `${totalMolds} molds in system`],
      ['Process Control', totalProcesses > 0 ? 'Active' : 'Idle', `${processes.filter(p => p.status === 'ongoing').length} ongoing processes`],
      ['User Management', users.length > 0 ? 'Active' : 'No Users', `${users.length} registered users`],
      ['Customer Base', customers.length > 0 ? 'Established' : 'Growing', `${customers.length} customers`],
      [''],
      ['📊 Chart Recommendations:'],
      ['• Create Pie Chart using Status Distribution data (rows 18-' + (18 + Object.keys(statusDistribution).length - 1) + ')'],
      ['• Create Line Chart using Monthly Trends data (rows ' + (22 + Object.keys(statusDistribution).length) + '-' + (22 + Object.keys(statusDistribution).length + Object.keys(monthlyTrends).length - 1) + ')'],
      ['• Create Bar Chart using Top Customers data (rows ' + (26 + Object.keys(statusDistribution).length + Object.keys(monthlyTrends).length) + '-' + (26 + Object.keys(statusDistribution).length + Object.keys(monthlyTrends).length + topCustomers.length - 1) + ')']
    ];

    const dashboardWs = XLSX.utils.aoa_to_sheet(dashboardData);
    
    // Enhanced styling
    const range = XLSX.utils.decode_range(dashboardWs['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!dashboardWs[cellAddress]) continue;
        
        // Style headers and separators
        if (dashboardData[R] && typeof dashboardData[R][0] === 'string' && 
            (dashboardData[R][0].includes('═══') || 
             dashboardData[R][0].includes('TTMS') ||
             dashboardData[R][0].includes('INDICATORS') ||
             dashboardData[R][0].includes('DISTRIBUTION') ||
             dashboardData[R][0].includes('TRENDS') ||
             dashboardData[R][0].includes('CUSTOMERS') ||
             dashboardData[R][0].includes('OVERVIEW'))) {
          dashboardWs[cellAddress].s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: "E3F2FD" } },
            alignment: { horizontal: 'center' }
          };
        }
      }
    }

    // Set column widths
    dashboardWs['!cols'] = [
      { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(workbook, dashboardWs, 'Executive Dashboard');
  };

  // Create Analytics Data Sheet (Combined Analytics)
  const createAnalyticsDataSheet = (workbook, molds, processes) => {
    // Process type analysis
    const processTypes = processes.reduce((acc, process) => {
      const type = process.process || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Machine utilization
    const machineUtil = processes.reduce((acc, process) => {
      const machine = process.machine || 'Unknown';
      acc[machine] = (acc[machine] || 0) + 1;
      return acc;
    }, {});

    // Category analysis
    const categoryAnalysis = molds.reduce((acc, mold) => {
      const category = mold.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const analyticsData = [
      ['ANALYTICS DATA FOR CHARTS'],
      [''],
      ['═══════════════════════════════════════'],
      ['PROCESS TYPE DISTRIBUTION'],
      ['═══════════════════════════════════════'],
      ['Process Type', 'Count', 'Percentage'],
      ...Object.entries(processTypes)
        .sort(([,a], [,b]) => b - a)
        .map(([type, count]) => [
          type,
          count,
          `${((count / processes.length) * 100).toFixed(1)}%`
        ]),
      [''],
      ['═══════════════════════════════════════'],
      ['MACHINE UTILIZATION'],
      ['═══════════════════════════════════════'],
      ['Machine', 'Usage Count', 'Utilization %'],
      ...Object.entries(machineUtil)
        .sort(([,a], [,b]) => b - a)
        .map(([machine, count]) => [
          machine,
          count,
          `${((count / processes.length) * 100).toFixed(1)}%`
        ]),
      [''],
      ['═══════════════════════════════════════'],
      ['MOLD CATEGORY BREAKDOWN'],
      ['═══════════════════════════════════════'],
      ['Category', 'Count', 'Percentage'],
      ...Object.entries(categoryAnalysis)
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => [
          category,
          count,
          `${((count / molds.length) * 100).toFixed(1)}%`
        ]),
      [''],
      ['═══════════════════════════════════════'],
      ['PERFORMANCE METRICS'],
      ['═══════════════════════════════════════'],
      ['Metric', 'Current', 'Target', 'Variance'],
      ['Average Process Duration', 'Variable', '8 hours', 'Monitor'],
      ['Mold Delivery Accuracy', 'Variable', '95%', 'Track'],
      ['Customer Satisfaction', 'Variable', '4.5/5', 'Survey'],
      [''],
      ['📈 Recommended Charts:'],
      ['• Horizontal Bar Chart for Process Types'],
      ['• Donut Chart for Machine Utilization'],
      ['• Vertical Bar Chart for Mold Categories'],
      ['• Gauge Charts for Performance Metrics']
    ];

    const analyticsWs = XLSX.utils.aoa_to_sheet(analyticsData);
    
    // Set column widths
    analyticsWs['!cols'] = [
      { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, analyticsWs, 'Analytics Data');
  };

  // Create Consolidated Data Sheet (All Raw Data)
  const createConsolidatedDataSheet = (workbook, molds, processes, users, customers) => {
    const consolidatedData = [
      ['CONSOLIDATED SYSTEM DATA'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['═══════════════════════════════════════'],
      ['MOLDS DATA'],
      ['═══════════════════════════════════════'],
      ['ID', 'Mold No', 'Customer', 'Status', 'Category', 'Created Date', 'Plate Size', 'Investment No'],
      ...molds.map(mold => [
        mold.id || '',
        mold.moldNo || '',
        mold.customer || '',
        mold.status || '',
        mold.category || '',
        mold.createdDate ? new Date(mold.createdDate).toLocaleDateString() : '',
        mold.plateSize || '',
        mold.investmentNo || ''
      ]),
      [''],
      ['═══════════════════════════════════════'],
      ['PROCESSES DATA'],
      ['═══════════════════════════════════════'],
      ['ID', 'Process Type', 'Mold No', 'Status', 'Machine', 'Started At', 'Duration'],
      ...processes.map(process => {
        let duration = 'Ongoing';
        if (process.startedAt && process.finishedAt) {
          const start = new Date(process.startedAt);
          const end = new Date(process.finishedAt);
          const hours = Math.round((end - start) / (1000 * 60 * 60) * 100) / 100;
          duration = `${hours}h`;
        }
        
        return [
          process.id || '',
          process.process || '',
          process.moldNo || '',
          process.status || '',
          process.machine || '',
          process.startedAt ? new Date(process.startedAt).toLocaleDateString() : '',
          duration
        ];
      }),
      [''],
      ['═══════════════════════════════════════'],
      ['USERS DATA'],
      ['═══════════════════════════════════════'],
      ['ID', 'Name', 'Email', 'Role', 'EPF No', 'Status'],
      ...users.map(user => [
        user.id || '',
        `${user.firstname || ''} ${user.lastname || ''}`.trim(),
        user.email || '',
        user.role || '',
        user.epfNo || '',
        user.status || 'Active'
      ]),
      [''],
      ['═══════════════════════════════════════'],
      ['CUSTOMERS DATA'],
      ['═══════════════════════════════════════'],
      ['ID', 'Full Name', 'Company', 'Email', 'Phone'],
      ...customers.map(customer => [
        customer.id || '',
        customer.fullname || '',
        customer.company || '',
        customer.email || '',
        customer.phone || ''
      ])
    ];

    const consolidatedWs = XLSX.utils.aoa_to_sheet(consolidatedData);
    
    // Set column widths
    consolidatedWs['!cols'] = [
      { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, consolidatedWs, 'All Data');
  };

  // Default button component
  const DefaultButton = () => (
    <button
      onClick={generateComprehensiveReport}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
    >
      {isGenerating ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Generating Report...
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-5 h-5" />
          Generate BI Excel Report
        </>
      )}
    </button>
  );

  // If triggerComponent is provided, clone it with the onClick handler
  if (triggerComponent) {
    return React.cloneElement(triggerComponent, {
      onClick: generateComprehensiveReport,
      disabled: isGenerating
    });
  }

  // Default render
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Business Intelligence Report</h2>
          <p className="text-gray-600">Generate streamlined Excel report with chart-ready data</p>
        </div>
        <Download className="w-8 h-8 text-green-600" />
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900">Report Includes:</h4>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Executive Dashboard with KPIs</li>
              <li>• Chart-ready Analytics Data</li>
              <li>• Consolidated Raw Data</li>
              <li>• Visual Chart Recommendations</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900">Only 3 Sheets:</h4>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>📊 Executive Dashboard</li>
              <li>📈 Analytics Data</li>
              <li>📋 All Data</li>
              <li>🎯 Optimized & Clean</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 mt-0.5">💡</div>
            <div className="text-sm text-blue-800">
              <strong>Chart Instructions:</strong> Each sheet includes specific row references for creating charts in Excel. 
              Use Insert → Charts and select the recommended data ranges.
            </div>
          </div>
        </div>
        
        <DefaultButton />
      </div>
    </div>
  );
};

export default BIReportExcel;