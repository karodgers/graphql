export function renderXPProgressGraph(container, xpTransactions, timePeriod = 'week') {
  // Get container dimensions
  const cardWidth = container.offsetWidth || 400;
  const cardHeight = container.offsetHeight || 280;
  
  // Graph dimensions - use more of the available space
  const width = cardWidth - 40;
  const height = cardHeight - 20;
  const margin = { top: 15, right: 40, bottom: 60, left: 60 };
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;
  
  // Process real XP transaction data
  const processedData = processXPData(xpTransactions, timePeriod);
  
  if (processedData.length === 0) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">
        No XP data available for the selected time period
      </div>
    `;
    return;
  }
  
  // Calculate scales
  const maxXP = Math.max(...processedData.map(d => d.xp));
  const minXP = Math.min(...processedData.map(d => d.xp));
  const xScale = graphWidth / (processedData.length - 1);
  
  // Ensure we have a proper range for the y-axis
  const yRange = maxXP - minXP;
  const yScale = yRange > 0 ? (graphHeight - 25) / yRange : 1;
  
  // Create path for the line - ensure it stays within bounds
  const linePath = processedData.map((point, index) => {
    const x = index * xScale;
    // Ensure y value stays within the graph bounds
    const rawY = (graphHeight - 25) - ((point.xp - minXP) * yScale);
    const y = Math.max(0, Math.min(graphHeight - 25, rawY));
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Create area path that stays within bounds
  const areaPath = processedData.map((point, index) => {
    const x = index * xScale;
    const rawY = (graphHeight - 25) - ((point.xp - minXP) * yScale);
    const y = Math.max(0, Math.min(graphHeight - 25, rawY));
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ` L ${graphWidth} ${graphHeight - 25} L 0 ${graphHeight - 25} Z`;
  
  // Create SVG
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%; max-height: 100%;">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#4facfe;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:0.1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000020"/>
        </filter>
        <style>
          .data-point {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .data-point:hover {
            r: 6;
            fill: #4facfe;
            stroke-width: 3;
          }
          .line-path {
            transition: stroke-width 0.3s ease;
          }
          .line-path:hover {
            stroke-width: 4;
          }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="rgba(255,255,255,0.1)" rx="8"/>
      
      <!-- Time period filter buttons -->
      <g transform="translate(20, 20)">
        <g style="cursor: pointer;" onclick="window.switchXPTimePeriod('week')">
          <rect x="0" y="0" width="50" height="25" fill="${timePeriod === 'week' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}" rx="4" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <text x="25" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="white">Week</text>
        </g>
        
        <g style="cursor: pointer;" onclick="window.switchXPTimePeriod('month')">
          <rect x="60" y="0" width="50" height="25" fill="${timePeriod === 'month' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}" rx="4" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <text x="85" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="white">Month</text>
        </g>
        
        <g style="cursor: pointer;" onclick="window.switchXPTimePeriod('year')">
          <rect x="120" y="0" width="50" height="25" fill="${timePeriod === 'year' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}" rx="4" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <text x="145" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="white">Year</text>
        </g>
      </g>
      
      <!-- Main chart area -->
      <g transform="translate(${margin.left}, ${margin.top + 25})">
        
        <!-- Y-axis -->
        <line x1="0" y1="0" x2="0" y2="${graphHeight - 25}" stroke="#ddd" stroke-width="1"/>
        <text x="-20" y="${(graphHeight - 25)/2}" text-anchor="middle" transform="rotate(-90, -20, ${(graphHeight - 25)/2})" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#666">XP Earned</text>
        
        <!-- X-axis -->
        <line x1="0" y1="${graphHeight - 25}" x2="${graphWidth}" y2="${graphHeight - 25}" stroke="#ddd" stroke-width="1"/>
        <text x="${graphWidth/2}" y="${graphHeight + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#666">Time Period</text>
        
        <!-- Grid lines -->
        <line x1="0" y1="${(graphHeight - 25)/3}" x2="${graphWidth}" y2="${(graphHeight - 25)/3}" stroke="#eee" stroke-width="1" stroke-dasharray="2,2"/>
        <line x1="0" y1="${2*(graphHeight - 25)/3}" x2="${graphWidth}" y2="${2*(graphHeight - 25)/3}" stroke="#eee" stroke-width="1" stroke-dasharray="2,2"/>
        
        <!-- Area under the line -->
        <path d="${areaPath}" fill="url(#areaGradient)"/>
        
        <!-- Line path -->
        <path class="line-path" d="${linePath}" stroke="url(#lineGradient)" stroke-width="3" fill="none" filter="url(#shadow)"/>
        
        <!-- Data points -->
        ${processedData.map((point, index) => {
          const x = index * xScale;
          const rawY = (graphHeight - 25) - ((point.xp - minXP) * yScale);
          const y = Math.max(0, Math.min(graphHeight - 25, rawY));
          return `
            <circle class="data-point" cx="${x}" cy="${y}" r="4" fill="#4facfe" stroke="#fff" stroke-width="2"/>
          `;
        }).join('')}
        
        <!-- X-axis labels -->
        ${processedData.map((point, index) => {
          const x = index * xScale;
          return `
            <text x="${x}" y="${graphHeight - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">${point.label}</text>
          `;
        }).join('')}
      </g>
    </svg>
  `;
  
  container.innerHTML = svg;
  
  // Store the current data and container for time period switching
  window.currentXPData = { xpTransactions, container };
  window.switchXPTimePeriod = (newTimePeriod) => {
    renderXPProgressGraph(window.currentXPData.container, window.currentXPData.xpTransactions, newTimePeriod);
  };
}

function processXPData(transactions, timePeriod) {
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  const now = new Date();
  const data = [];
  let cumulativeXP = 0;
  
  // Group transactions by time period
  const groupedData = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    let key;
    
    switch(timePeriod) {
      case 'week':
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        key = date.getDate().toString();
        break;
      case 'year':
        key = date.toLocaleDateString('en-US', { month: 'short' });
        break;
      default:
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    if (!groupedData[key]) {
      groupedData[key] = 0;
    }
    groupedData[key] += transaction.amount;
  });
  
  // Create time periods and accumulate XP
  const timeLabels = generateTimeLabels(timePeriod);
  
  timeLabels.forEach(label => {
    if (groupedData[label]) {
      cumulativeXP += groupedData[label];
    }
    data.push({
      label: label,
      xp: cumulativeXP
    });
  });
  
  return data;
}

function generateTimeLabels(timePeriod) {
  const now = new Date();
  const labels = [];
  
  switch(timePeriod) {
    case 'week':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }
      break;
    case 'month':
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.getDate().toString());
      }
      break;
    case 'year':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
      break;
  }
  
  return labels;
} 
