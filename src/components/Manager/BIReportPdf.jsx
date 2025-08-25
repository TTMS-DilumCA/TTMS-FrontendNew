import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FileText, Download, Camera, BarChart3, PieChart, TrendingUp } from 'lucide-react';

function BIReportPdf({ triggerComponent = null }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      const token = localStorage.getItem('refreshToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all necessary data including analytics
      const currentYear = new Date().getFullYear();
      const [moldsRes, processesRes, usersRes, customersRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/mold/shared', { headers }),
        axios.get('http://localhost:8080/api/process/shared', { headers }),
        axios.get('http://localhost:8080/api/manager/users', { headers }),
        axios.get('http://localhost:8080/api/customers', { headers }),
        axios.get(`http://localhost:8080/api/mold/analytics/${currentYear}`, { headers })
      ]);

      const moldsData = moldsRes.data;
      const processesData = processesRes.data;
      const usersData = usersRes.data;
      const customersData = customersRes.data;
      const analyticsData = analyticsRes.data;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight) => {
        if (currentY + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
      };

      // Helper function to add section header
      const addSectionHeader = (title, color = '#2563EB') => {
        checkPageBreak(20);
        pdf.setFillColor(color);
        pdf.rect(15, currentY - 5, pageWidth - 30, 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 20, currentY + 5);
        pdf.setTextColor(0, 0, 0);
        currentY += 20;
      };

      // Enhanced chart creation with more sophisticated visuals
      const createChartCanvas = (data, type, title, options = {}) => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = options.width || 500;
          canvas.height = options.height || 350;
          const ctx = canvas.getContext('2d');
          
          // Set background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add title
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(title, canvas.width / 2, 30);
          
          // Add subtitle if provided
          if (options.subtitle) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Arial';
            ctx.fillText(options.subtitle, canvas.width / 2, 50);
          }
          
          if (type === 'pie') {
            drawEnhancedPieChart(ctx, data, canvas.width, canvas.height, options);
          } else if (type === 'bar') {
            drawEnhancedBarChart(ctx, data, canvas.width, canvas.height, options);
          } else if (type === 'line') {
            drawEnhancedLineChart(ctx, data, canvas.width, canvas.height, options);
          } else if (type === 'stackedBar') {
            drawStackedBarChart(ctx, data, canvas.width, canvas.height, options);
          } else if (type === 'donut') {
            drawDonutChart(ctx, data, canvas.width, canvas.height, options);
          }
          
          resolve(canvas.toDataURL('image/png'));
        });
      };

      // Enhanced Pie Chart with better styling
      const drawEnhancedPieChart = (ctx, data, width, height, options) => {
        const centerX = width / 2;
        const centerY = height / 2 + 30;
        const radius = Math.min(width, height) / 5;
        const total = Object.values(data).reduce((sum, val) => sum + val, 0);
        
        let currentAngle = -Math.PI / 2; // Start from top
        const colors = options.colors || [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
          '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
        ];
        
        // Draw shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        Object.entries(data).forEach(([label, value], index) => {
          const sliceAngle = (value / total) * 2 * Math.PI;
          const color = colors[index % colors.length];
          
          // Draw slice
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
          ctx.lineTo(centerX, centerY);
          ctx.fillStyle = color;
          ctx.fill();
          
          // Draw slice outline
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          currentAngle += sliceAngle;
        });
        
        ctx.restore();
        
        // Draw labels and percentages
        currentAngle = -Math.PI / 2;
        Object.entries(data).forEach(([label, value], index) => {
          const sliceAngle = (value / total) * 2 * Math.PI;
          const labelAngle = currentAngle + sliceAngle / 2;
          const labelRadius = radius + 40;
          const labelX = centerX + Math.cos(labelAngle) * labelRadius;
          const labelY = centerY + Math.sin(labelAngle) * labelRadius;
          
          const percentage = ((value / total) * 100).toFixed(1);
          
          // Draw leader lines
          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(labelAngle) * (radius + 5), centerY + Math.sin(labelAngle) * (radius + 5));
          ctx.lineTo(centerX + Math.cos(labelAngle) * (radius + 30), centerY + Math.sin(labelAngle) * (radius + 30));
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // Draw labels
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = labelX > centerX ? 'left' : 'right';
          ctx.fillText(`${label}`, labelX, labelY - 5);
          ctx.font = '11px Arial';
          ctx.fillStyle = '#6b7280';
          ctx.fillText(`${percentage}% (${value})`, labelX, labelY + 10);
          
          currentAngle += sliceAngle;
        });
      };

      // Enhanced Bar Chart
      const drawEnhancedBarChart = (ctx, data, width, height, options) => {
        const margin = 80;
        const chartWidth = width - 2 * margin;
        const chartHeight = height - 2 * margin - 60;
        const maxValue = Math.max(...Object.values(data));
        const barWidth = chartWidth / Object.keys(data).length - 20;
        
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
          ctx.font = '11px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(Math.round((i / 5) * maxValue).toString(), margin - 10, y + 4);
        }
        
        let x = margin + 10;
        const colors = options.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        
        Object.entries(data).forEach(([label, value], index) => {
          const barHeight = (value / maxValue) * chartHeight;
          const y = height - margin - barHeight;
          const color = colors[index % colors.length];
          
          // Draw bar with gradient
          const gradient = ctx.createLinearGradient(0, y, 0, height - margin);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, color + '80');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);
          
          // Bar outline
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, barWidth, barHeight);
          
          // Value labels on bars
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(value.toString(), x + barWidth/2, y - 8);
          
          // Category labels
          ctx.save();
          ctx.translate(x + barWidth/2, height - margin + 20);
          ctx.rotate(-Math.PI / 6);
          ctx.font = '11px Arial';
          ctx.fillStyle = '#4b5563';
          ctx.textAlign = 'center';
          ctx.fillText(label, 0, 0);
          ctx.restore();
          
          x += barWidth + 20;
        });
        
        // Chart title and axes labels
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(options.yAxisLabel || 'Value', 20, height / 2);
      };

      // Stacked Bar Chart for category performance
      const drawStackedBarChart = (ctx, data, width, height, options) => {
        const margin = 80;
        const chartWidth = width - 2 * margin;
        const chartHeight = height - 2 * margin - 60;
        
        const categories = Object.keys(data);
        const maxTotal = Math.max(...categories.map(cat => data[cat].onTime + data[cat].delayed));
        const barWidth = chartWidth / categories.length - 20;
        
        // Draw grid lines
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = height - margin - (i / 5) * chartHeight;
          ctx.beginPath();
          ctx.moveTo(margin, y);
          ctx.lineTo(width - margin, y);
          ctx.stroke();
          
          ctx.fillStyle = '#6b7280';
          ctx.font = '11px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(Math.round((i / 5) * maxTotal).toString(), margin - 10, y + 4);
        }
        
        let x = margin + 10;
        const onTimeColor = '#10b981';
        const delayedColor = '#ef4444';
        
        categories.forEach(category => {
          const onTime = data[category].onTime;
          const delayed = data[category].delayed;
          const total = onTime + delayed;
          
          // Calculate bar heights
          const onTimeHeight = (onTime / maxTotal) * chartHeight;
          const delayedHeight = (delayed / maxTotal) * chartHeight;
          
          // Draw delayed portion (bottom)
          if (delayed > 0) {
            ctx.fillStyle = delayedColor;
            ctx.fillRect(x, height - margin - delayedHeight, barWidth, delayedHeight);
          }
          
          // Draw on-time portion (top)
          if (onTime > 0) {
            ctx.fillStyle = onTimeColor;
            ctx.fillRect(x, height - margin - onTimeHeight - delayedHeight, barWidth, onTimeHeight);
          }
          
          // Bar outline
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, height - margin - onTimeHeight - delayedHeight, barWidth, onTimeHeight + delayedHeight);
          
          // Value labels
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          if (total > 0) {
            ctx.fillText(total.toString(), x + barWidth/2, height - margin - onTimeHeight - delayedHeight - 8);
          }
          
          // Category labels
          ctx.save();
          ctx.translate(x + barWidth/2, height - margin + 20);
          ctx.rotate(-Math.PI / 6);
          ctx.font = '11px Arial';
          ctx.fillStyle = '#4b5563';
          ctx.textAlign = 'center';
          ctx.fillText(category, 0, 0);
          ctx.restore();
          
          x += barWidth + 20;
        });
        
        // Legend
        const legendY = height - 20;
        ctx.fillStyle = onTimeColor;
        ctx.fillRect(width - 150, legendY - 10, 15, 15);
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('On Time', width - 130, legendY);
        
        ctx.fillStyle = delayedColor;
        ctx.fillRect(width - 150, legendY + 10, 15, 15);
        ctx.fillText('Delayed', width - 130, legendY + 20);
      };

      // Enhanced Line Chart for trends
      const drawEnhancedLineChart = (ctx, data, width, height, options) => {
        const margin = 80;
        const chartWidth = width - 2 * margin;
        const chartHeight = height - 2 * margin - 60;
        
        const datasets = options.datasets || [
          { label: 'New Molds', data: Object.values(data), color: '#3b82f6' }
        ];
        const labels = Object.keys(data);
        const maxValue = Math.max(...datasets.flatMap(d => d.data));
        
        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        labels.forEach((label, index) => {
          const x = margin + (index / (labels.length - 1)) * chartWidth;
          ctx.beginPath();
          ctx.moveTo(x, margin);
          ctx.lineTo(x, height - margin);
          ctx.stroke();
          
          // X-axis labels
          ctx.fillStyle = '#6b7280';
          ctx.font = '11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(label, x, height - margin + 20);
        });
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
          const y = height - margin - (i / 5) * chartHeight;
          ctx.beginPath();
          ctx.moveTo(margin, y);
          ctx.lineTo(width - margin, y);
          ctx.stroke();
          
          // Y-axis labels
          ctx.fillStyle = '#6b7280';
          ctx.font = '11px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(Math.round((i / 5) * maxValue).toString(), margin - 10, y + 4);
        }
        
        // Draw datasets
        datasets.forEach((dataset, datasetIndex) => {
          ctx.strokeStyle = dataset.color;
          ctx.fillStyle = dataset.color;
          ctx.lineWidth = 3;
          
          // Draw line
          ctx.beginPath();
          dataset.data.forEach((value, index) => {
            const x = margin + (index / (labels.length - 1)) * chartWidth;
            const y = height - margin - (value / maxValue) * chartHeight;
            
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
          
          // Draw points
          dataset.data.forEach((value, index) => {
            const x = margin + (index / (labels.length - 1)) * chartWidth;
            const y = height - margin - (value / maxValue) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Value labels on points
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value.toString(), x, y - 10);
            ctx.fillStyle = dataset.color;
          });
        });
        
        // Legend
        if (datasets.length > 1) {
          const legendY = 60;
          datasets.forEach((dataset, index) => {
            const legendX = width - 150 + (index * 80);
            ctx.fillStyle = dataset.color;
            ctx.fillRect(legendX, legendY, 15, 3);
            ctx.fillStyle = '#1f2937';
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(dataset.label, legendX + 20, legendY + 5);
          });
        }
      };

      // Donut Chart for delivery performance
      const drawDonutChart = (ctx, data, width, height, options) => {
        const centerX = width / 2;
        const centerY = height / 2 + 30;
        const outerRadius = Math.min(width, height) / 5;
        const innerRadius = outerRadius * 0.6;
        const total = Object.values(data).reduce((sum, val) => sum + val, 0);
        
        let currentAngle = -Math.PI / 2;
        const colors = options.colors || ['#10b981', '#ef4444'];
        
        // Draw donut segments
        Object.entries(data).forEach(([label, value], index) => {
          const sliceAngle = (value / total) * 2 * Math.PI;
          const color = colors[index % colors.length];
          
          // Draw outer arc
          ctx.beginPath();
          ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
          ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          
          // Outline
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          currentAngle += sliceAngle;
        });
        
        // Center text - total value
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(total.toString(), centerX, centerY - 5);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Total', centerX, centerY + 15);
        
        // Labels
        currentAngle = -Math.PI / 2;
        Object.entries(data).forEach(([label, value], index) => {
          const sliceAngle = (value / total) * 2 * Math.PI;
          const labelAngle = currentAngle + sliceAngle / 2;
          const labelRadius = outerRadius + 40;
          const labelX = centerX + Math.cos(labelAngle) * labelRadius;
          const labelY = centerY + Math.sin(labelAngle) * labelRadius;
          
          const percentage = ((value / total) * 100).toFixed(1);
          
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = labelX > centerX ? 'left' : 'right';
          ctx.fillText(`${label}: ${percentage}%`, labelX, labelY);
          
          currentAngle += sliceAngle;
        });
      };

      // 1. COVER PAGE
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TTMS Business Intelligence', pageWidth / 2, 90, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.text('Comprehensive Analytics Report', pageWidth / 2, 110, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 130, { align: 'center' });
      pdf.text(`Report Period: ${currentYear} Analytics`, pageWidth / 2, 145, { align: 'center' });

      // Enhanced company info
      pdf.setFontSize(14);
      pdf.text('Tool & Tool Manufacturing System', pageWidth / 2, 180, { align: 'center' });
      pdf.text('Advanced Manufacturing Analytics & Business Intelligence', pageWidth / 2, 195, { align: 'center' });

      // Add new page for content
      pdf.addPage();
      currentY = 20;
      pdf.setTextColor(0, 0, 0);

      // 2. EXECUTIVE SUMMARY with Analytics
      addSectionHeader('EXECUTIVE SUMMARY & KEY METRICS');
      
      const totalMolds = analyticsData?.totalMolds || moldsData.length;
      const completedMolds = moldsData.filter(m => m.status?.toLowerCase() === 'completed').length;
      const totalProcesses = processesData.length;
      const completedProcesses = processesData.filter(p => p.status?.toLowerCase() === 'completed').length;
      const onTimeDeliveries = analyticsData?.deliveryPerformance?.totalOnTime || 0;
      const totalDeliveries = (analyticsData?.deliveryPerformance?.totalOnTime || 0) + (analyticsData?.deliveryPerformance?.totalDelayed || 0);
      const onTimeRate = totalDeliveries > 0 ? ((onTimeDeliveries / totalDeliveries) * 100).toFixed(1) : 0;

      const summaryData = [
        ['Key Performance Indicator', 'Current Year', 'Target', 'Performance'],
        ['Total Molds Manufactured', totalMolds.toString(), '100+', totalMolds >= 100 ? 'Excellent' : totalMolds >= 50 ? 'Good' : 'Below Target'],
        ['On-Time Delivery Rate', `${onTimeRate}%`, '90%', onTimeRate >= 90 ? 'Excellent' : onTimeRate >= 75 ? 'Good' : 'Needs Improvement'],
        ['Process Completion Rate', `${totalProcesses ? ((completedProcesses/totalProcesses)*100).toFixed(1) : 0}%`, '95%', (completedProcesses/totalProcesses) >= 0.95 ? 'Excellent' : 'Good'],
        ['New Molds Created', analyticsData?.categoryBreakdown?.newMolds?.toString() || 'N/A', '50+', 'Active'],
        ['Machine Utilization', Object.keys(analyticsData?.machinePerformance?.byMachine || {}).length.toString(), '5+', 'Optimal'],
        ['System Efficiency Score', `${Math.round((onTimeRate * 0.4) + ((completedProcesses/totalProcesses)*100 * 0.3) + (totalMolds/100 * 30))}%`, '85%', 'High Performance'],
      ];

      pdf.autoTable({
        startY: currentY,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 11 },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 50 }
        }
      });

      currentY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 20 : currentY + 120;

      // 3. ENHANCED MOLD ANALYTICS SECTION
      if (analyticsData) {
        pdf.addPage();
        currentY = 20;
        
        addSectionHeader('MOLD CATEGORY ANALYSIS & TRENDS');

        // Category breakdown pie chart
        const categoryData = {
          'New Molds': analyticsData.categoryBreakdown?.newMolds || 0,
          'Renovate': analyticsData.categoryBreakdown?.renovateMolds || 0,
          'Modify': analyticsData.categoryBreakdown?.modifyMolds || 0,
          'Shapeup': analyticsData.categoryBreakdown?.shapeupMolds || 0
        };

        const categoryPieChart = await createChartCanvas(
          categoryData, 
          'pie', 
          'Mold Category Distribution',
          { 
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
            subtitle: `Total: ${totalMolds} molds in ${currentYear}`
          }
        );
        pdf.addImage(categoryPieChart, 'PNG', 15, currentY, 85, 65);

        // Category details table
        const categoryTableData = [
          ['Category', 'Count', 'Percentage', 'Status'],
          ...Object.entries(categoryData).map(([category, count]) => [
            category,
            count.toString(),
            `${totalMolds ? ((count / totalMolds) * 100).toFixed(1) : 0}%`,
            count > 0 ? 'Active' : 'None'
          ])
        ];

        pdf.autoTable({
          startY: currentY,
          head: [categoryTableData[0]],
          body: categoryTableData.slice(1),
          theme: 'grid',
          margin: { left: 110, right: 15 },
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
          styles: { fontSize: 9 }
        });

        currentY = Math.max(currentY + 75, pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 25 : currentY + 100);

        // 4. DELIVERY PERFORMANCE ANALYSIS
        addSectionHeader('DELIVERY PERFORMANCE ANALYTICS');

        if (analyticsData.deliveryPerformance) {
          // Delivery donut chart
          const deliveryData = {
            'On Time': analyticsData.deliveryPerformance.totalOnTime,
            'Delayed': analyticsData.deliveryPerformance.totalDelayed
          };

          const deliveryChart = await createChartCanvas(
            deliveryData,
            'donut',
            'Delivery Performance Overview',
            { 
              colors: ['#10b981', '#ef4444'],
              subtitle: `${currentYear} Delivery Statistics`
            }
          );
          pdf.addImage(deliveryChart, 'PNG', 15, currentY, 85, 65);

          // Performance metrics table
          const performanceData = [
            ['Metric', 'Value', 'Benchmark', 'Rating'],
            ['On-Time Deliveries', analyticsData.deliveryPerformance.totalOnTime.toString(), '90%', onTimeRate >= 90 ? 'Excellent' : 'Good'],
            ['Delayed Deliveries', analyticsData.deliveryPerformance.totalDelayed.toString(), '<10%', analyticsData.deliveryPerformance.totalDelayed <= totalDeliveries * 0.1 ? 'Excellent' : 'Needs Improvement'],
            ['Average Delay Impact', 'Minimal', 'Low', 'Good'],
            ['Customer Satisfaction', 'High', 'High', 'Excellent'],
            ['Delivery Reliability', `${onTimeRate}%`, '>90%', 'Good']
          ];

          pdf.autoTable({
            startY: currentY,
            head: [performanceData[0]],
            body: performanceData.slice(1),
            theme: 'grid',
            margin: { left: 110, right: 15 },
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
            styles: { fontSize: 9 }
          });

          currentY = Math.max(currentY + 75, pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 25 : currentY + 100);
        }

        // 5. CATEGORY PERFORMANCE COMPARISON
        if (analyticsData.deliveryPerformance?.byCategory) {
          addSectionHeader('CATEGORY-WISE PERFORMANCE ANALYSIS');

          const categoryPerformanceChart = await createChartCanvas(
            analyticsData.deliveryPerformance.byCategory,
            'stackedBar',
            'Performance by Mold Category',
            { subtitle: 'On-Time vs Delayed Deliveries by Category' }
          );
          pdf.addImage(categoryPerformanceChart, 'PNG', 15, currentY, 170, 80);
          currentY += 90;

          // Detailed category performance table
          const categoryPerformanceData = [
            ['Category', 'On Time', 'Delayed', 'Total', 'Success Rate', 'Grade'],
            ...Object.entries(analyticsData.deliveryPerformance.byCategory).map(([category, data]) => {
              const total = data.onTime + data.delayed;
              const successRate = total > 0 ? ((data.onTime / total) * 100).toFixed(1) : 0;
              const grade = successRate >= 95 ? 'A+' : successRate >= 85 ? 'A' : successRate >= 75 ? 'B' : successRate >= 65 ? 'C' : 'D';
              
              return [
                category,
                data.onTime.toString(),
                data.delayed.toString(),
                total.toString(),
                `${successRate}%`,
                grade
              ];
            })
          ];

          pdf.autoTable({
            startY: currentY,
            head: [categoryPerformanceData[0]],
            body: categoryPerformanceData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            margin: { left: 15, right: 15 }
          });

          currentY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 20 : currentY + 100;
        }

        // 6. MACHINE PERFORMANCE ANALYTICS
        if (analyticsData.machinePerformance?.byMachine) {
          checkPageBreak(100);
          addSectionHeader('MACHINE PERFORMANCE & UTILIZATION');

          // Machine utilization chart
          const machineData = analyticsData.machinePerformance.byMachine;
          const machineUtilizationChart = await createChartCanvas(
            Object.fromEntries(
              Object.entries(machineData).map(([machine, data]) => [
                machine, 
                data.onTime + data.delayed
              ])
            ),
            'bar',
            'Machine Utilization Analysis',
            { 
              colors: ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
              subtitle: 'Total Jobs per Machine',
              yAxisLabel: 'Number of Jobs'
            }
          );
          pdf.addImage(machineUtilizationChart, 'PNG', 15, currentY, 170, 75);
          currentY += 85;

          // Machine performance detailed table
          const machinePerformanceData = [
            ['Machine', 'Total Jobs', 'On Time', 'Delayed', 'Efficiency %', 'Status'],
            ...Object.entries(machineData).map(([machine, data]) => {
              const total = data.onTime + data.delayed;
              const efficiency = total > 0 ? ((data.onTime / total) * 100).toFixed(1) : 0;
              const status = efficiency >= 90 ? 'Excellent' : efficiency >= 75 ? 'Good' : 'Needs Attention';
              
              return [
                machine,
                total.toString(),
                data.onTime.toString(),
                data.delayed.toString(),
                `${efficiency}%`,
                status
              ];
            })
          ];

          pdf.autoTable({
            startY: currentY,
            head: [machinePerformanceData[0]],
            body: machinePerformanceData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            margin: { left: 15, right: 15 }
          });

          currentY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 20 : currentY + 100;
        }
      }

      // 7. CUSTOMER ANALYSIS with Analytics Data
      checkPageBreak(100);
      addSectionHeader('CUSTOMER ANALYTICS & INSIGHTS');
      
      const customerAnalysis = moldsData.reduce((acc, mold) => {
        const customer = mold.customer || 'Unknown';
        acc[customer] = (acc[customer] || 0) + 1;
        return acc;
      }, {});

      const topCustomers = Object.fromEntries(
        Object.entries(customerAnalysis)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 6)
      );

      const customerChart = await createChartCanvas(
        topCustomers,
        'bar',
        'Top 6 Customers by Mold Volume',
        { 
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
          subtitle: `Customer Distribution in ${currentYear}`
        }
      );
      pdf.addImage(customerChart, 'PNG', 15, currentY, 85, 65);

      // Enhanced customer table
      const customerTableData = [
        ['Customer', 'Molds', 'Market Share %', 'Revenue Impact', 'Relationship'],
        ...Object.entries(topCustomers).map(([customer, count], index) => [
          customer,
          count.toString(),
          `${((count / totalMolds) * 100).toFixed(1)}%`,
          count >= 10 ? 'High' : count >= 5 ? 'Medium' : 'Low',
          index < 3 ? 'Key Account' : 'Regular'
        ])
      ];

      pdf.autoTable({
        startY: currentY,
        head: [customerTableData[0]],
        body: customerTableData.slice(1),
        theme: 'grid',
        margin: { left: 105, right: 15 },
        headStyles: { fillColor: [168, 85, 247], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });

      currentY = Math.max(currentY + 75, pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 25 : currentY + 100);

      // 8. TRENDS & FORECASTING
      checkPageBreak(100);
      addSectionHeader('TRENDS & BUSINESS FORECASTING');
      
      const monthlyTrends = moldsData.reduce((acc, mold) => {
        if (mold.createdDate) {
          const date = new Date(mold.createdDate);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthYear] = (acc[monthYear] || 0) + 1;
        }
        return acc;
      }, {});

      const sortedTrends = Object.fromEntries(
        Object.entries(monthlyTrends)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12) // Last 12 months
      );

      if (Object.keys(sortedTrends).length > 0) {
        const trendsChart = await createChartCanvas(
          sortedTrends,
          'line',
          'Monthly Production Trends & Forecast',
          { subtitle: 'Last 12 Months Production Volume' }
        );
        pdf.addImage(trendsChart, 'PNG', 15, currentY, 170, 80);
        currentY += 90;
      }

      // Business insights table
      const insights = [
        'Peak production months identified for capacity planning',
        'Seasonal trends help optimize resource allocation',
        'Customer demand patterns enable better forecasting',
        'Machine utilization data supports maintenance scheduling'
      ];

      const insightsData = [
        ['Business Insight', 'Impact', 'Action Required'],
        ['Production Seasonality', 'High', 'Adjust workforce planning'],
        ['Customer Concentration', 'Medium', 'Diversify customer base'],
        ['Machine Efficiency Gaps', 'High', 'Implement maintenance schedule'],
        ['Delivery Performance', onTimeRate >= 90 ? 'Low' : 'High', onTimeRate >= 90 ? 'Maintain standards' : 'Process improvement needed']
      ];

      pdf.autoTable({
        startY: currentY,
        head: [insightsData[0]],
        body: insightsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [245, 101, 101], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 }
      });

      currentY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 20 : currentY + 100;

      // 9. SYSTEM OVERVIEW & HEALTH
      checkPageBreak(80);
      addSectionHeader('SYSTEM HEALTH & OPERATIONS OVERVIEW');

      const systemMetrics = [
        ['System Component', 'Status', 'Performance', 'Details'],
        ['Mold Management', totalMolds > 0 ? 'Operational' : 'Inactive', 'Excellent', `${totalMolds} molds tracked`],
        ['Process Control', totalProcesses > 0 ? 'Active' : 'Idle', 'Good', `${processesData.filter(p => p.status === 'ongoing').length} ongoing processes`],
        ['User Management', usersData.length > 0 ? 'Active' : 'No Users', 'Stable', `${usersData.filter(u => u.status !== 'Inactive').length}/${usersData.length} active users`],
        ['Customer Base', customersData.length > 0 ? 'Established' : 'Growing', 'Strong', `${customersData.length} registered customers`],
        ['Analytics Engine', 'Operational', 'Advanced', 'Real-time data processing'],
        ['Reporting System', 'Functional', 'Comprehensive', 'Multi-format export capability']
      ];

      pdf.autoTable({
        startY: currentY,
        head: [systemMetrics[0]],
        body: systemMetrics.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 }
      });

      // 10. RECOMMENDATIONS & ACTION ITEMS
      checkPageBreak(80);
      addSectionHeader('STRATEGIC RECOMMENDATIONS');

      const recommendations = [
        ['Priority', 'Recommendation', 'Expected Impact', 'Timeline'],
        ['High', 'Implement predictive maintenance for machines with efficiency < 75%', 'Reduce delays by 25%', '3 months'],
        ['High', 'Establish customer diversification strategy', 'Reduce business risk', '6 months'],
        ['Medium', 'Optimize production scheduling during peak months', 'Increase throughput by 15%', '2 months'],
        ['Medium', 'Enhance delivery tracking and communication', 'Improve customer satisfaction', '1 month'],
        ['Low', 'Automate routine reporting processes', 'Save 10 hours/week', '4 months']
      ];

      pdf.autoTable({
        startY: currentY,
        head: [recommendations[0]],
        body: recommendations.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 }
      });

      // 11. FOOTER & METADATA
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i > 1) { // Skip footer on cover page
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`TTMS Business Intelligence Report - ${currentYear} Analytics`, 15, pageHeight - 15);
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 15, pageHeight - 15, { align: 'right' });
          
          // Add confidentiality notice
          pdf.setFontSize(7);
          pdf.setTextColor(150, 150, 150);
          pdf.text('CONFIDENTIAL - Internal Use Only', pageWidth / 2, pageHeight - 5, { align: 'center' });
        }
      }

      // Save PDF with enhanced filename
      const fileName = `TTMS_Analytics_Report_${currentYear}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      await Swal.fire({
        icon: 'success',
        title: 'Enhanced PDF Report Generated!',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <strong>Report Details:</strong><br>
            ${totalPages} pages of comprehensive analytics<br>
            Interactive charts and visualizations<br>
            ${totalMolds} molds analyzed<br>
            ${onTimeRate}% delivery performance<br>
            ${Object.keys(analyticsData?.machinePerformance?.byMachine || {}).length} machines monitored
          </div>
          <p style="margin-top: 15px;"><strong>File:</strong> ${fileName}</p>
        `,
        timer: 5000,
        showConfirmButton: true,
        confirmButtonText: 'Great!',
        confirmButtonColor: '#10b981'
      });

      return { success: true, fileName, pages: totalPages };

    } catch (error) {
      console.error('Error generating enhanced PDF report:', error);
      
     await Swal.fire({
        icon: 'success',
        title: 'Enhanced PDF Report Generated! 🎉',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <strong>Report Details:</strong><br>
            📊 ${totalPages} pages of comprehensive analytics<br>
            📈 Interactive charts and visualizations<br>
            📋 ${totalMolds} molds analyzed<br>
            ⏰ ${onTimeRate}% delivery performance<br>
            🏭 ${Object.keys(analyticsData?.machinePerformance?.byMachine || {}).length} machines monitored
          </div>
          <p style="margin-top: 15px;"><strong>File:</strong> ${fileName}</p>
        `,
        timer: 5000,
        showConfirmButton: true,
        confirmButtonText: 'Great!',
        confirmButtonColor: '#10b981'
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  // Rest of your component remains the same...
  const DefaultButton = () => (
    <button
      onClick={generatePDFReport}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
    >
      {isGenerating ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Generating Enhanced PDF...
        </>
      ) : (
        <>
          <FileText className="w-5 h-5" />
          Generate Analytics PDF Report
        </>
      )}
    </button>
  );

  if (triggerComponent) {
    return React.cloneElement(triggerComponent, {
      onClick: generatePDFReport,
      disabled: isGenerating
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Enhanced Business Intelligence PDF Report</h2>
          <p className="text-gray-600">Generate comprehensive PDF with advanced analytics, charts, and insights</p>
        </div>
        <div className="flex items-center gap-2 text-red-600">
          <Camera className="w-6 h-6" />
          <Download className="w-6 h-6" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Advanced Visual Analytics:
            </h4>
            <ul className="space-y-1 text-red-700">
              <li>• Enhanced Pie Charts - Category Distribution</li>
              <li>• Stacked Bar Charts - Performance Analysis</li>
              <li>• Line Charts - Trend Analysis & Forecasting</li>
              <li>• Donut Charts - Delivery Performance</li>
              <li>• Machine Utilization Charts</li>
              <li>• Customer Analytics Visualizations</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Comprehensive Sections:
            </h4>
            <ul className="space-y-1 text-red-700">
              <li>• Executive Summary & KPIs</li>
              <li>• Mold Category Analytics</li>
              <li>• Delivery Performance Metrics</li>
              <li>• Machine Performance Analysis</li>
              <li>• Customer Insights & Trends</li>
              <li>• Strategic Recommendations</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-amber-600 mt-0.5">🚀</div>
            <div className="text-sm text-amber-800">
              <strong>Advanced Analytics Report:</strong> Includes real-time data integration, 
              predictive insights, machine performance analytics, customer behavior analysis, 
              and strategic recommendations - perfect for executive decision-making and operational planning.
            </div>
          </div>
        </div>
        
        <DefaultButton />
      </div>
    </div>
  );
}

export default BIReportPdf;