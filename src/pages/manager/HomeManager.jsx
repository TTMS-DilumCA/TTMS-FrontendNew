import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Network, 
  FileText, 
  Users, 
  Wrench, 
  UserCircle,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react";
import NavBarManager from "./NavBarManager";
import Footer from "../../components/common/Footer";

const HomeManager = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const cardData = [
    {
      title: "Mold Management",
      description: "Comprehensive mold details management with real-time tracking and maintenance scheduling",
      icon: <PlusCircle className="w-12 h-12" />,
      onClick: () => navigate("/mold-details"),
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      shadowColor: "shadow-blue-200",
      category: "Operations"
    },
    {
      title: "Process Control",
      description: "Monitor and control machine processes with advanced analytics and performance metrics",
      icon: <Network className="w-12 h-12" />,
      onClick: () => navigate("/process-details"),
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      shadowColor: "shadow-purple-200",
      category: "Operations"
    },
    {
      title: "Business Intelligence",
      description: "Generate detailed reports and analytics for data-driven decision making",
      icon: <FileText className="w-12 h-12" />,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      shadowColor: "shadow-green-200",
      category: "Analytics"
    },
    {
      title: "User Administration",
      description: "Manage user accounts, roles, and permissions with enterprise-grade security",
      icon: <Users className="w-12 h-12" />,
      onClick: () => navigate("/users"),
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      shadowColor: "shadow-orange-200",
      category: "Administration"
    },
    {
      title: "Tool Configuration",
      description: "Advanced tool profile management and configuration optimization",
      icon: <Wrench className="w-12 h-12" />,
      gradient: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      hoverColor: "hover:bg-teal-100",
      shadowColor: "shadow-teal-200",
      category: "Configuration"
    },
    {
      title: "Account Settings",
      description: "Personalize your workspace and manage your professional profile",
      icon: <UserCircle className="w-12 h-12" />,
      onClick: () => navigate("/profile-manager"),
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      hoverColor: "hover:bg-indigo-100",
      shadowColor: "shadow-indigo-200",
      category: "Personal"
    },
  ];
  return (
    <>
      <NavBarManager />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="absolute -bottom-8 -left-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">            {/* Header */}
            <div className="text-center mb-16">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                  Management Dashboard
                </span>
                <h1 className="text-xl sm:text-2xl font-light text-gray-600 mb-2">
                  Welcome to the
                </h1>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-6">
                  Tool Time Management System
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Streamline your operations with our comprehensive management platform designed for efficiency, precision, and scalability.
                </p>
              </div>
              
              {/* Quick Stats */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/30">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">99.8%</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">System Uptime</div>
                  <div className="text-xs text-gray-500">Reliable 24/7 operations</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/30">
                  <div className="flex items-center justify-center mb-3">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">ISO 9001</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Quality Certified</div>
                  <div className="text-xs text-gray-500">Industry standard compliance</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/30">
                  <div className="flex items-center justify-center mb-3">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">Real-time</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Data Processing</div>
                  <div className="text-xs text-gray-500">Instant system updates</div>
                </div>
              </div> */}
            </div>

          {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cardData.map((item, index) => (
                <div
                  key={index}
                  className={`group relative ${item.bgColor} ${item.hoverColor} rounded-xl shadow-lg ${item.shadowColor} transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-200 overflow-hidden`}
                  onClick={item.onClick}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative p-8 h-full flex flex-col">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {item.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed flex-grow group-hover:text-gray-700 transition-colors">
                      {item.description}
                    </p>
                    
                    {/* Action Indicator */}
                    <div className="flex justify-between items-center mt-6">
                      <div className="text-xs text-gray-500 font-medium">
                        Click to access
                      </div>
                      <ArrowRight className={`w-5 h-5 text-gray-400 transition-all duration-300 ${hoveredCard === index ? 'translate-x-1 text-gray-600' : ''}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default HomeManager;
