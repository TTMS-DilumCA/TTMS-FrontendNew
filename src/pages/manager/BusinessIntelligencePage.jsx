import React, { useState } from 'react';
import { 
  BarChart3,
  Activity,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import NavBarManager from './NavBarManager';
import MoldAnalytics from '../../components/Manager/MoldAnalytics';
import SystemOverview from '../../components/Manager/SystemOverview';
import BIReportExcel from '../../components/Manager/BIReportExcel';
import BIReportPdf from '../../components/Manager/BIReportPdf';
import BIReportReactPdf from '../../components/Manager/BIReportReactPdf';

function BusinessIntelligencePage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <>
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
                {/* Tab Navigation */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                  <TabButton
                    id="analytics"
                    label="Mold Analytics"
                    icon={BarChart3}
                    isActive={activeTab === 'analytics'}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id="overview"
                    label="System Overview"
                    icon={Activity}
                    isActive={activeTab === 'overview'}
                    onClick={setActiveTab}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'analytics' ? (
            <MoldAnalytics selectedYear={selectedYear} onYearChange={setSelectedYear} />
          ) : (
            <SystemOverview />
          )}

          {/* Report Generator Cards */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BIReportReactPdf selectedYear={selectedYear} />
          </div>
        </div>
      </div>
    </>
  );
}

export default BusinessIntelligencePage;