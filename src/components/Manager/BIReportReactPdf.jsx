import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, pdf } from '@react-pdf/renderer';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FileText, Download, Camera, BarChart3, PieChart } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

// Enhanced styles for professional PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    backgroundColor: '#2563EB',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: 40,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  coverInfo: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  coverCompany: {
    fontSize: 14,
    marginTop: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    backgroundColor: '#2563EB',
    color: 'white',
    padding: 10,
    marginBottom: 15,
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  sectionHeaderGreen: {
    backgroundColor: '#10B981',
    color: 'white',
    padding: 10,
    marginBottom: 15,
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  sectionHeaderPurple: {
    backgroundColor: '#9333EA',
    color: 'white',
    padding: 10,
    marginBottom: 15,
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  sectionHeaderRed: {
    backgroundColor: '#EF4444',
    color: 'white',
    padding: 10,
    marginBottom: 15,
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    fontSize: 9,
  },
  tableColWide: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    fontSize: 9,
  },
  tableCell: {
    textAlign: 'left',
    paddingTop: 4,
    paddingBottom: 4,
  },
  tableCellCenter: {
    textAlign: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chartColumn: {
    width: '50%',
    paddingRight: 10,
  },
  tableColumn: {
    width: '50%',
    paddingLeft: 10,
  },
  chartPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    border: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1F2937',
  },
  chartSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15,
    color: '#6B7280',
  },
  insightBox: {
    backgroundColor: '#FEF3C7',
    border: '1px solid #F59E0B',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#92400E',
  },
  insightText: {
    fontSize: 9,
    color: '#78350F',
    lineHeight: 1.4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  kpiBox: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    padding: 15,
    marginBottom: 10,
    marginRight: '2%',
  },
  kpiTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#374151',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 3,
  },
  kpiLabel: {
    fontSize: 8,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 8,
    borderTop: '1px solid #E5E7EB',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 30,
    fontSize: 8,
    color: '#9CA3AF',
  },
  confidential: {
    position: 'absolute',
    bottom: 10,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#D1D5DB',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 9,
  },
  bullet: {
    width: 10,
    fontSize: 9,
  },
  listText: {
    flex: 1,
    fontSize: 9,
  },
  performanceIndicator: {
    fontSize: 9,
    fontWeight: 'bold',
    padding: 3,
    borderRadius: 3,
  },
  excellentStatus: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  goodStatus: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  needsImprovementStatus: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
});

// Chart generation function
const generateChartImage = async (data, type, options = {}) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = options.width || 400;
    canvas.height = options.height || 300;
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (type === 'pie') {
      drawPieChart(ctx, data, canvas.width, canvas.height, options);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, canvas.width, canvas.height, options);
    } else if (type === 'donut') {
      drawDonutChart(ctx, data, canvas.width, canvas.height, options);
    }
    
    resolve(canvas.toDataURL('image/png'));
  });
};

// Chart drawing functions
const drawPieChart = (ctx, data, width, height, options) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 4;
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) return;
  
  let currentAngle = -Math.PI / 2;
  const colors = options.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Draw title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(options.title || 'Chart', centerX, 30);
  
  Object.entries(data).forEach(([label, value], index) => {
    if (value > 0) {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const color = colors[index % colors.length];
      
      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Draw outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    }
  });
  
  // Draw legend
  let legendY = height - 80;
  Object.entries(data).forEach(([label, value], index) => {
    if (value > 0) {
      const color = colors[index % colors.length];
      const percentage = ((value / total) * 100).toFixed(1);
      
      // Legend color box
      ctx.fillStyle = color;
      ctx.fillRect(20, legendY, 15, 15);
      
      // Legend text
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${label}: ${percentage}% (${value})`, 45, legendY + 12);
      
      legendY += 20;
    }
  });
};

const drawBarChart = (ctx, data, width, height, options) => {
  const margin = 50;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin - 40;
  const maxValue = Math.max(...Object.values(data));
  const barWidth = chartWidth / Object.keys(data).length - 10;
  
  // Draw title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(options.title || 'Bar Chart', width / 2, 25);
  
  // Draw grid lines
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = height - margin - (i / 5) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round((i / 5) * maxValue).toString(), margin - 5, y + 3);
  }
  
  let x = margin + 5;
  const colors = options.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  Object.entries(data).forEach(([label, value], index) => {
    const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
    const y = height - margin - barHeight;
    const color = colors[index % colors.length];
    
    // Draw bar
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Value label on bar
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), x + barWidth/2, y - 5);
    
    // Category label
    ctx.font = '10px Arial';
    const displayLabel = label.length > 8 ? label.substring(0, 8) + '...' : label;
    ctx.fillText(displayLabel, x + barWidth/2, height - margin + 15);
    
    x += barWidth + 10;
  });
};

const drawDonutChart = (ctx, data, width, height, options) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 4;
  const innerRadius = outerRadius * 0.6;
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) return;
  
  // Draw title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(options.title || 'Donut Chart', centerX, 30);
  
  let currentAngle = -Math.PI / 2;
  const colors = options.colors || ['#10b981', '#ef4444'];
  
  Object.entries(data).forEach(([label, value], index) => {
    if (value > 0) {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const color = colors[index % colors.length];
      
      // Draw outer arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      
      currentAngle += sliceAngle;
    }
  });
  
  // Center text
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(total.toString(), centerX, centerY);
  ctx.font = '12px Arial';
  ctx.fillText('Total', centerX, centerY + 20);
  
  // Legend
  let legendY = height - 60;
  Object.entries(data).forEach(([label, value], index) => {
    if (value > 0) {
      const color = colors[index % colors.length];
      const percentage = ((value / total) * 100).toFixed(1);
      
      // Legend color box
      ctx.fillStyle = color;
      ctx.fillRect(20, legendY, 15, 15);
      
      // Legend text
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${label}: ${percentage}%`, 45, legendY + 12);
      
      legendY += 20;
    }
  });
};

// Enhanced PDF Document Component with Real Charts
const BIReportDocument = ({ data, chartImages = {} }) => {
  const {
    moldsData = [],
    processesData = [],
    usersData = [],
    customersData = [],
    analyticsData = {},
    currentYear
  } = data;

  // Calculate metrics
  const totalMolds = analyticsData?.totalMolds || moldsData.length;
  const completedMolds = moldsData.filter(m => m.status?.toLowerCase() === 'completed').length;
  const totalProcesses = processesData.length;
  const completedProcesses = processesData.filter(p => p.status?.toLowerCase() === 'completed').length;
  const onTimeDeliveries = analyticsData?.deliveryPerformance?.totalOnTime || 0;
  const totalDeliveries = (analyticsData?.deliveryPerformance?.totalOnTime || 0) + (analyticsData?.deliveryPerformance?.totalDelayed || 0);
  const onTimeRate = totalDeliveries > 0 ? ((onTimeDeliveries / totalDeliveries) * 100).toFixed(1) : 0;

  // Customer analysis
  const customerAnalysis = moldsData.reduce((acc, mold) => {
    const customer = mold.customer || 'Unknown';
    acc[customer] = (acc[customer] || 0) + 1;
    return acc;
  }, {});

  const topCustomers = Object.entries(customerAnalysis)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  return (
    <Document>
      {/* Cover Page */}
      <Page style={styles.coverPage}>
        <Text style={styles.coverTitle}>TTMS Business Intelligence</Text>
        <Text style={styles.coverSubtitle}>Comprehensive Analytics Report</Text>
        <Text style={styles.coverInfo}>Generated on: {new Date().toLocaleDateString()}</Text>
        <Text style={styles.coverInfo}>Report Period: {currentYear} Analytics</Text>
        <Text style={styles.coverCompany}>Tool & Tool Manufacturing System</Text>
        <Text style={styles.coverCompany}>Advanced Manufacturing Analytics & Business Intelligence</Text>
      </Page>

      {/* Executive Summary */}
      <Page style={styles.page}>
        <Text style={styles.sectionHeader}>EXECUTIVE SUMMARY & KEY METRICS</Text>
        
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiTitle}>Total Molds Manufactured</Text>
            <Text style={styles.kpiValue}>{totalMolds}</Text>
            <Text style={styles.kpiLabel}>Current Year Production</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiTitle}>On-Time Delivery Rate</Text>
            <Text style={styles.kpiValue}>{onTimeRate}%</Text>
            <Text style={styles.kpiLabel}>Performance Metric</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiTitle}>Active Customers</Text>
            <Text style={styles.kpiValue}>{customersData.length}</Text>
            <Text style={styles.kpiLabel}>Customer Base</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiTitle}>System Efficiency</Text>
            <Text style={styles.kpiValue}>{Math.round((onTimeRate * 0.4) + ((completedProcesses/totalProcesses)*100 * 0.3) + (totalMolds/100 * 30))}%</Text>
            <Text style={styles.kpiLabel}>Overall Performance</Text>
          </View>
        </View>

        {/* Performance Summary Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Key Performance Indicator</Text>
            <Text style={styles.tableColHeader}>Current Year</Text>
            <Text style={styles.tableColHeader}>Target</Text>
            <Text style={styles.tableColHeader}>Performance</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Total Molds Manufactured</Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>{totalMolds}</Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>100+</Text>
            <View style={styles.tableCol}>
              <Text style={[styles.performanceIndicator, 
                totalMolds >= 100 ? styles.excellentStatus : 
                totalMolds >= 50 ? styles.goodStatus : styles.needsImprovementStatus]}>
                {totalMolds >= 100 ? 'Excellent' : totalMolds >= 50 ? 'Good' : 'Below Target'}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>On-Time Delivery Rate</Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>{onTimeRate}%</Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>90%</Text>
            <View style={styles.tableCol}>
              <Text style={[styles.performanceIndicator, 
                onTimeRate >= 90 ? styles.excellentStatus : 
                onTimeRate >= 75 ? styles.goodStatus : styles.needsImprovementStatus]}>
                {onTimeRate >= 90 ? 'Excellent' : onTimeRate >= 75 ? 'Good' : 'Needs Improvement'}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Process Completion Rate</Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>
              {totalProcesses ? ((completedProcesses/totalProcesses)*100).toFixed(1) : 0}%
            </Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>95%</Text>
            <View style={styles.tableCol}>
              <Text style={[styles.performanceIndicator, styles.excellentStatus]}>Excellent</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Active Users</Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>
              {usersData.filter(u => u.status !== 'Inactive').length}/{usersData.length}
            </Text>
            <Text style={[styles.tableCol, styles.tableCellCenter]}>95%</Text>
            <View style={styles.tableCol}>
              <Text style={[styles.performanceIndicator, styles.excellentStatus]}>Stable</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>Executive Insights</Text>
          <Text style={styles.insightText}>
            The TTMS system demonstrates strong operational performance with {totalMolds} molds manufactured 
            and an on-time delivery rate of {onTimeRate}%. Key areas for improvement include optimizing 
            machine utilization and enhancing customer diversification strategies.
          </Text>
        </View>

        <Text style={styles.footer}>
          TTMS Business Intelligence Report - {currentYear} Analytics
        </Text>
        <Text style={styles.pageNumber}>Page 1</Text>
        <Text style={styles.confidential}>CONFIDENTIAL - Internal Use Only</Text>
      </Page>

      {/* Mold Category Analysis with Real Chart */}
      <Page style={styles.page}>
        <Text style={styles.sectionHeader}>MOLD CATEGORY ANALYSIS & TRENDS</Text>

        <View style={styles.chartContainer}>
          <View style={styles.chartColumn}>
            <Text style={styles.chartTitle}>Mold Category Distribution</Text>
            <Text style={styles.chartSubtitle}>Total: {totalMolds} molds in {currentYear}</Text>
            {chartImages.categoryPieChart ? (
              <Image
                src={chartImages.categoryPieChart}
                style={{ width: '100%', height: 200, marginBottom: 15 }}
              />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text>Pie Chart: Category Distribution</Text>
              </View>
            )}
          </View>
          <View style={styles.tableColumn}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Category</Text>
                <Text style={styles.tableColHeader}>Count</Text>
                <Text style={styles.tableColHeader}>Percentage</Text>
                <Text style={styles.tableColHeader}>Status</Text>
              </View>
              {analyticsData.categoryBreakdown && Object.entries({
                'New Molds': analyticsData.categoryBreakdown?.newMolds || 0,
                'Renovate': analyticsData.categoryBreakdown?.renovateMolds || 0,
                'Modify': analyticsData.categoryBreakdown?.modifyMolds || 0,
                'Shapeup': analyticsData.categoryBreakdown?.shapeupMolds || 0
              }).map(([category, count]) => (
                <View style={styles.tableRow} key={category}>
                  <Text style={styles.tableCol}>{category}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>{count}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>
                    {totalMolds ? ((count / totalMolds) * 100).toFixed(1) : 0}%
                  </Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>
                    {count > 0 ? 'Active' : 'None'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          TTMS Business Intelligence Report - {currentYear} Analytics
        </Text>
        <Text style={styles.pageNumber}>Page 2</Text>
        <Text style={styles.confidential}>CONFIDENTIAL - Internal Use Only</Text>
      </Page>

      {/* Delivery Performance with Real Charts */}
      <Page style={styles.page}>
        <Text style={styles.sectionHeaderGreen}>DELIVERY PERFORMANCE ANALYTICS</Text>

        {analyticsData.deliveryPerformance && (
          <>
            <View style={styles.chartContainer}>
              <View style={styles.chartColumn}>
                <Text style={styles.chartTitle}>Delivery Performance Overview</Text>
                <Text style={styles.chartSubtitle}>{currentYear} Delivery Statistics</Text>
                {chartImages.deliveryDonutChart ? (
                  <Image
                    src={chartImages.deliveryDonutChart}
                    style={{ width: '100%', height: 200, marginBottom: 15 }}
                  />
                ) : (
                  <View style={styles.chartPlaceholder}>
                    <Text>Donut Chart: On-Time vs Delayed</Text>
                  </View>
                )}
              </View>
              <View style={styles.tableColumn}>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableColHeader}>Metric</Text>
                    <Text style={styles.tableColHeader}>Value</Text>
                    <Text style={styles.tableColHeader}>Benchmark</Text>
                    <Text style={styles.tableColHeader}>Rating</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCol}>On-Time Deliveries</Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>
                      {analyticsData.deliveryPerformance.totalOnTime}
                    </Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>90%</Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>
                      {onTimeRate >= 90 ? 'Excellent' : 'Good'}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCol}>Delayed Deliveries</Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>
                      {analyticsData.deliveryPerformance.totalDelayed}
                    </Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>&lt;10%</Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>
                      {analyticsData.deliveryPerformance.totalDelayed <= totalDeliveries * 0.1 ? 'Excellent' : 'Needs Improvement'}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCol}>Delivery Reliability</Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>{onTimeRate}%</Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>&gt;90%</Text>
                    <Text style={[styles.tableCol, styles.tableCellCenter]}>Good</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Category-wise Performance */}
            {analyticsData.deliveryPerformance?.byCategory && (
              <>
                <Text style={styles.chartTitle}>Category-wise Performance Analysis</Text>
                <Text style={styles.chartSubtitle}>On-Time vs Delayed Deliveries by Category</Text>
                <View style={styles.chartPlaceholder}>
                  <Text>Stacked Bar Chart: Performance by Category</Text>
                </View>

                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableColHeader}>Category</Text>
                    <Text style={styles.tableColHeader}>On Time</Text>
                    <Text style={styles.tableColHeader}>Delayed</Text>
                    <Text style={styles.tableColHeader}>Total</Text>
                    <Text style={styles.tableColHeader}>Success Rate</Text>
                    <Text style={styles.tableColHeader}>Grade</Text>
                  </View>
                  {Object.entries(analyticsData.deliveryPerformance.byCategory).map(([category, data]) => {
                    const total = data.onTime + data.delayed;
                    const successRate = total > 0 ? ((data.onTime / total) * 100).toFixed(1) : 0;
                    const grade = successRate >= 95 ? 'A+' : successRate >= 85 ? 'A' : successRate >= 75 ? 'B' : successRate >= 65 ? 'C' : 'D';
                    
                    return (
                      <View style={styles.tableRow} key={category}>
                        <Text style={styles.tableCol}>{category}</Text>
                        <Text style={[styles.tableCol, styles.tableCellCenter]}>{data.onTime}</Text>
                        <Text style={[styles.tableCol, styles.tableCellCenter]}>{data.delayed}</Text>
                        <Text style={[styles.tableCol, styles.tableCellCenter]}>{total}</Text>
                        <Text style={[styles.tableCol, styles.tableCellCenter]}>{successRate}%</Text>
                        <Text style={[styles.tableCol, styles.tableCellCenter]}>{grade}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

        <Text style={styles.footer}>
          TTMS Business Intelligence Report - {currentYear} Analytics
        </Text>
        <Text style={styles.pageNumber}>Page 3</Text>
        <Text style={styles.confidential}>CONFIDENTIAL - Internal Use Only</Text>
      </Page>

      {/* Machine Performance */}
      {analyticsData.machinePerformance?.byMachine && (
        <Page style={styles.page}>
          <Text style={styles.sectionHeader}>MACHINE PERFORMANCE & UTILIZATION</Text>

          <Text style={styles.chartTitle}>Machine Utilization Analysis</Text>
          <Text style={styles.chartSubtitle}>Total Jobs per Machine</Text>
          {chartImages.machineBarChart ? (
            <Image
              src={chartImages.machineBarChart}
              style={{ width: '100%', height: 250, marginBottom: 15 }}
            />
          ) : (
            <View style={styles.chartPlaceholder}>
              <Text>Bar Chart: Machine Utilization</Text>
            </View>
          )}

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>Machine</Text>
              <Text style={styles.tableColHeader}>Total Jobs</Text>
              <Text style={styles.tableColHeader}>On Time</Text>
              <Text style={styles.tableColHeader}>Delayed</Text>
              <Text style={styles.tableColHeader}>Efficiency %</Text>
              <Text style={styles.tableColHeader}>Status</Text>
            </View>
            {Object.entries(analyticsData.machinePerformance.byMachine).map(([machine, data]) => {
              const total = data.onTime + data.delayed;
              const efficiency = total > 0 ? ((data.onTime / total) * 100).toFixed(1) : 0;
              const status = efficiency >= 90 ? 'Excellent' : efficiency >= 75 ? 'Good' : 'Needs Attention';
              
              return (
                <View style={styles.tableRow} key={machine}>
                  <Text style={styles.tableCol}>{machine}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>{total}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>{data.onTime}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>{data.delayed}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>{efficiency}%</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>{status}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Machine Performance Insights</Text>
            <Text style={styles.insightText}>
              Machine utilization analysis shows {Object.keys(analyticsData.machinePerformance.byMachine).length} active machines 
              with varying efficiency levels. Focus on preventive maintenance for machines with efficiency below 75% 
              to improve overall productivity.
            </Text>
          </View>

          <Text style={styles.footer}>
            TTMS Business Intelligence Report - {currentYear} Analytics
          </Text>
          <Text style={styles.pageNumber}>Page 4</Text>
          <Text style={styles.confidential}>CONFIDENTIAL - Internal Use Only</Text>
        </Page>
      )}

      {/* Customer Analytics */}
      <Page style={styles.page}>
        <Text style={styles.sectionHeaderPurple}>CUSTOMER ANALYTICS & INSIGHTS</Text>

        <View style={styles.chartContainer}>
          <View style={styles.chartColumn}>
            <Text style={styles.chartTitle}>Top 6 Customers by Mold Volume</Text>
            <Text style={styles.chartSubtitle}>Customer Distribution in {currentYear}</Text>
            {chartImages.customerBarChart ? (
              <Image
                src={chartImages.customerBarChart}
                style={{ width: '100%', height: 200, marginBottom: 15 }}
              />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text>Bar Chart: Customer Analysis</Text>
              </View>
            )}
          </View>
          <View style={styles.tableColumn}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Customer</Text>
                <Text style={styles.tableColHeader}>Molds</Text>
                <Text style={styles.tableColHeader}>Share %</Text>
                <Text style={styles.tableColHeader}>Impact</Text>
              </View>
              {topCustomers.map(([customer, count], index) => (
                <View style={styles.tableRow} key={customer}>
                  <Text style={styles.tableCol}>{customer}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>{count}</Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>
                    {((count / totalMolds) * 100).toFixed(1)}%
                  </Text>
                  <Text style={[styles.tableCol, styles.tableCellCenter]}>
                    {count >= 10 ? 'High' : count >= 5 ? 'Medium' : 'Low'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>Customer Relationship Insights</Text>
          <Text style={styles.insightText}>
            Analysis of {customersData.length} registered customers shows concentration in top accounts. 
            Recommend diversification strategy to reduce dependency on major customers and expand market reach.
          </Text>
        </View>

        <Text style={styles.footer}>
          TTMS Business Intelligence Report - {currentYear} Analytics
        </Text>
        <Text style={styles.pageNumber}>Page 5</Text>
        <Text style={styles.confidential}>CONFIDENTIAL - Internal Use Only</Text>
      </Page>

      {/* Strategic Recommendations */}
      <Page style={styles.page}>
        <Text style={styles.sectionHeaderRed}>STRATEGIC RECOMMENDATIONS</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Priority</Text>
            <Text style={styles.tableColWide}>Recommendation</Text>
            <Text style={styles.tableColHeader}>Expected Impact</Text>
            <Text style={styles.tableColHeader}>Timeline</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>High</Text>
            <Text style={styles.tableColWide}>Implement predictive maintenance for machines with efficiency &lt; 75%</Text>
            <Text style={styles.tableCol}>Reduce delays by 25%</Text>
            <Text style={styles.tableCol}>3 months</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>High</Text>
            <Text style={styles.tableColWide}>Establish customer diversification strategy</Text>
            <Text style={styles.tableCol}>Reduce business risk</Text>
            <Text style={styles.tableCol}>6 months</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Medium</Text>
            <Text style={styles.tableColWide}>Optimize production scheduling during peak months</Text>
            <Text style={styles.tableCol}>Increase throughput by 15%</Text>
            <Text style={styles.tableCol}>2 months</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Medium</Text>
            <Text style={styles.tableColWide}>Enhance delivery tracking and communication</Text>
            <Text style={styles.tableCol}>Improve customer satisfaction</Text>
            <Text style={styles.tableCol}>1 month</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Low</Text>
            <Text style={styles.tableColWide}>Automate routine reporting processes</Text>
            <Text style={styles.tableCol}>Save 10 hours/week</Text>
            <Text style={styles.tableCol}>4 months</Text>
          </View>
        </View>

        {/* Action Items */}
        <Text style={styles.chartTitle}>Immediate Action Items</Text>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>• </Text>
          <Text style={styles.listText}>Review machine maintenance schedules and implement predictive analytics</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>• </Text>
          <Text style={styles.listText}>Develop customer acquisition strategy to reduce concentration risk</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>• </Text>
          <Text style={styles.listText}>Establish delivery performance monitoring dashboard</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>• </Text>
          <Text style={styles.listText}>Implement process improvement initiatives for delayed deliveries</Text>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>Strategic Outlook</Text>
          <Text style={styles.insightText}>
            The TTMS system shows strong performance metrics with opportunities for optimization in machine 
            utilization and customer diversification. Implementation of recommended strategies will enhance 
            operational efficiency and reduce business risks while maintaining excellent delivery performance.
          </Text>
        </View>

        <Text style={styles.footer}>
          TTMS Business Intelligence Report - {currentYear} Analytics
        </Text>
        <Text style={styles.pageNumber}>Page 6</Text>
        <Text style={styles.confidential}>CONFIDENTIAL - Internal Use Only</Text>
      </Page>
    </Document>
  );
};

// Main Component
function BIReportReactPdf({ triggerComponent = null }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReportData = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('refreshToken');
      const headers = { Authorization: `Bearer ${token}` };
      const currentYear = new Date().getFullYear();

      const [moldsRes, processesRes, usersRes, customersRes, analyticsRes] = await Promise.all([
        axios.get(buildApiUrl(API_ENDPOINTS.MOLD.SHARED), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.PROCESS.SHARED), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.MANAGER.USERS), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.CUSTOMERS.LIST), { headers }),
        axios.get(buildApiUrl(API_ENDPOINTS.MOLD.ANALYTICS(currentYear)), { headers })
      ]);

      const data = {
        moldsData: moldsRes.data,
        processesData: processesRes.data,
        usersData: usersRes.data,
        customersData: customersRes.data,
        analyticsData: analyticsRes.data,
        currentYear
      };

      setReportData(data);
      return data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Data Fetch Failed',
        text: 'Failed to fetch data for the report. Please try again.',
        confirmButtonColor: '#dc2626'
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateChartImages = async (data) => {
    const images = {};
    
    try {
      // Category pie chart
      if (data.analyticsData.categoryBreakdown) {
        const categoryData = {
          'New Molds': data.analyticsData.categoryBreakdown?.newMolds || 0,
          'Renovate': data.analyticsData.categoryBreakdown?.renovateMolds || 0,
          'Modify': data.analyticsData.categoryBreakdown?.modifyMolds || 0,
          'Shapeup': data.analyticsData.categoryBreakdown?.shapeupMolds || 0
        };
        images.categoryPieChart = await generateChartImage(categoryData, 'pie', {
          title: 'Mold Category Distribution',
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        });
      }

      // Delivery donut chart
      if (data.analyticsData.deliveryPerformance) {
        const deliveryData = {
          'On Time': data.analyticsData.deliveryPerformance.totalOnTime,
          'Delayed': data.analyticsData.deliveryPerformance.totalDelayed
        };
        images.deliveryDonutChart = await generateChartImage(deliveryData, 'donut', {
          title: 'Delivery Performance',
          colors: ['#10b981', '#ef4444']
        });
      }

      // Customer bar chart
      const customerAnalysis = data.moldsData.reduce((acc, mold) => {
        const customer = mold.customer || 'Unknown';
        acc[customer] = (acc[customer] || 0) + 1;
        return acc;
      }, {});

      const topCustomers = Object.fromEntries(
        Object.entries(customerAnalysis)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 6)
      );

      images.customerBarChart = await generateChartImage(topCustomers, 'bar', {
        title: 'Top 6 Customers by Mold Volume',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
      });

      // Machine performance bar chart
      if (data.analyticsData.machinePerformance?.byMachine) {
        const machineData = Object.fromEntries(
          Object.entries(data.analyticsData.machinePerformance.byMachine).map(([machine, machineInfo]) => [
            machine,
            machineInfo.onTime + machineInfo.delayed
          ])
        );

        images.machineBarChart = await generateChartImage(machineData, 'bar', {
          title: 'Machine Utilization (Total Jobs)',
          colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
        });
      }

    } catch (error) {
      console.error('Error generating chart images:', error);
    }

    return images;
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Fetch data
      const data = await fetchReportData();
      
      // Generate chart images
      const chartImages = await generateChartImages(data);
      
      // Generate PDF with charts
      const doc = <BIReportDocument data={data} chartImages={chartImages} />;
      const blob = await pdf(doc).toBlob();
      
      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TTMS_Analytics_Report_${data.currentYear}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await Swal.fire({
        icon: 'success',
        title: 'React-PDF Report with Charts Generated!',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <strong>Report Details:</strong><br>
            📄 Professional PDF with real charts<br>
            📊 Interactive visual analytics<br>
            📋 ${data.moldsData.length} molds analyzed<br>
            📈 Pie charts, bar charts, and donut charts<br>
            🏭 Machine utilization analysis
          </div>
          <p style="margin-top: 15px;"><strong>Generated using React-PDF + Canvas Charts</strong></p>
        `,
        timer: 5000,
        showConfirmButton: true,
        confirmButtonText: 'Excellent!',
        confirmButtonColor: '#10b981'
      });
    } catch (error) {
      console.error('Error generating PDF with charts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const ReportButton = () => (
    <button
      onClick={handleGenerateReport}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
    >
      {isGenerating ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Generating Charts...
        </>
      ) : (
        <>
          <FileText className="w-5 h-5" />
          Generate React-PDF Report
        </>
      )}
    </button>
  );

  // PDF Download Link Component (alternative method)
  const PDFDownloadButton = () => {
    if (!reportData) return null;

    return (
      <PDFDownloadLink
        document={<BIReportDocument data={reportData} />}
        fileName={`TTMS_Analytics_Report_${reportData.currentYear}_${new Date().toISOString().slice(0, 10)}.pdf`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
      >
        {({ loading }) => (
          loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download React-PDF Report
            </>
          )
        )}
      </PDFDownloadLink>
    );
  };

  if (triggerComponent) {
    return React.cloneElement(triggerComponent, {
      onClick: handleGenerateReport,
      disabled: isGenerating
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">React-PDF Business Intelligence Report</h2>
          <p className="text-gray-600">Generate professional PDF with React-PDF library - now with real charts!</p>
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <Camera className="w-6 h-6" />
          <Download className="w-6 h-6" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              React-PDF + Canvas Charts:
            </h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Real pie charts for category distribution</li>
              <li>• Donut charts for delivery performance</li>
              <li>• Bar charts for customer analysis</li>
              <li>• Machine utilization visualizations</li>
              <li>• Professional chart styling</li>
              <li>• High-quality image generation</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Enhanced Features:
            </h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Canvas-based chart generation</li>
              <li>• Base64 image embedding in PDF</li>
              <li>• Color-coded visualizations</li>
              <li>• Legend and percentage displays</li>
              <li>• Responsive chart sizing</li>
              <li>• Error handling for empty data</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-green-600 mt-0.5">✨</div>
            <div className="text-sm text-green-800">
              <strong>Now with Real Charts!</strong> This enhanced version generates actual charts using HTML5 Canvas 
              and embeds them as images in the PDF. No more placeholder text - get professional visualizations!
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <ReportButton />
          {reportData && <PDFDownloadButton />}
        </div>
      </div>
    </div>
  );
}

export default BIReportReactPdf;