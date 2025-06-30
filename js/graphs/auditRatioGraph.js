export function renderAuditRatioGraph(container, auditsDone, auditsReceived, auditRatio) {
  
  const ratio = auditRatio || 0;
  
  // Ensure container is properly sized before calculating dimensions
  setTimeout(() => {
    // Get container dimensions to make graph fill entire card
    const cardWidth = container.offsetWidth || 400;
    const cardHeight = container.offsetHeight || 280;
    
    // Graph dimensions - use full card space but leave some padding
    const width = cardWidth - 40;
    const height = cardHeight - 20; 
    const margin = { top: 15, right: 40, bottom: 60, left: 60 }; 
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
    // Calculate proper scaling for bars
    const totalDone = auditsDone.total;
    const totalReceived = auditsReceived.total;
    const maxValue = Math.max(totalDone, totalReceived);
    const scaleFactor = maxValue > 0 ? (graphHeight * 0.8) / maxValue : 1; 
    
    // Creating the SVG
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%; max-height: 100%;">
        <defs>
          <linearGradient id="doneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="receivedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffecd2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fcb69f;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="doneGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#3a8bfe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00d4fe;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="receivedGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffd4a8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f8a085;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000020"/>
          </filter>
          <filter id="shadowHover" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="4" stdDeviation="6" flood-color="#00000040"/>
          </filter>
          <style>
            .bar {
              transition: all 0.3s ease;
              cursor: pointer;
            }
            .bar:hover {
              transform: scale(1.05);
              filter: url(#shadowHover);
            }
            .bar-text {
              transition: all 0.3s ease;
            }
            .bar:hover + .bar-text {
              font-size: 16px;
              font-weight: 700;
            }
          </style>
        </defs>
        
        <!-- Background - made larger than content -->
        <rect width="${width}" height="${height}" fill="rgba(255,255,255,0.1)" rx="8"/>
        
        <!-- Main chart area - moved down to avoid title overlap -->
        <g transform="translate(${margin.left}, ${margin.top})">
          
          <!-- Y-axis -->
          <line x1="0" y1="0" x2="0" y2="${graphHeight - 25}" stroke="#ddd" stroke-width="1"/>
          <text x="-20" y="${(graphHeight - 25)/2}" text-anchor="middle" transform="rotate(-90, -20, ${(graphHeight - 25)/2})" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#666">Audit Count</text>
          
          <!-- X-axis -->
          <line x1="0" y1="${graphHeight - 25}" x2="${graphWidth}" y2="${graphHeight - 25}" stroke="#ddd" stroke-width="1"/>
          <text x="${graphWidth - 40}" y="${graphHeight + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#666">Audit Type</text>
          
          <!-- Grid lines -->
          <line x1="0" y1="${(graphHeight - 25)/3}" x2="${graphWidth}" y2="${(graphHeight - 25)/3}" stroke="#eee" stroke-width="1" stroke-dasharray="2,2"/>
          <line x1="0" y1="${2*(graphHeight - 25)/3}" x2="${graphWidth}" y2="${2*(graphHeight - 25)/3}" stroke="#eee" stroke-width="1" stroke-dasharray="2,2"/>
          
          <!-- Bars - properly scaled based on actual values -->
          <g>
            <!-- Audits Done Bar -->
            <rect class="bar" x="60" y="${(graphHeight - 25) - (totalDone * scaleFactor)}" 
                  width="80" height="${totalDone * scaleFactor}" 
                  fill="url(#doneGradient)" 
                  filter="url(#shadow)"
                  rx="4"
                  onmouseover="this.setAttribute('fill', 'url(#doneGradientHover)')"
                  onmouseout="this.setAttribute('fill', 'url(#doneGradient)')"/>
            <text class="bar-text" x="100" y="${(graphHeight - 25) - (totalDone * scaleFactor) - 8}" 
                  text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#333">${totalDone}</text>
            <text x="100" y="${graphHeight - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">Done</text>
            
            <!-- Audits Received Bar -->
            <rect class="bar" x="180" y="${(graphHeight - 25) - (totalReceived * scaleFactor)}" 
                  width="80" height="${totalReceived * scaleFactor}" 
                  fill="url(#receivedGradient)" 
                  filter="url(#shadow)"
                  rx="4"
                  onmouseover="this.setAttribute('fill', 'url(#receivedGradientHover)')"
                  onmouseout="this.setAttribute('fill', 'url(#receivedGradient)')"/>
            <text class="bar-text" x="220" y="${(graphHeight - 25) - (totalReceived * scaleFactor) - 8}" 
                  text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#333">${totalReceived}</text>
            <text x="220" y="${graphHeight - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">Received</text>
          </g>
          
          <!-- Ratio indicator - positioned at center-right, made larger -->
          <g transform="translate(${graphWidth - 90}, ${graphHeight/2 - 45})">
            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95" />
                <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:0.95" />
              </linearGradient>
              <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="#00000030"/>
              </filter>
            </defs>
            <circle cx="40" cy="40" r="38" fill="url(#circleGradient)" stroke="#e0e0e0" stroke-width="3" filter="url(#circleShadow)"/>
            <circle cx="40" cy="40" r="35" fill="none" stroke="#4facfe" stroke-width="2" stroke-dasharray="5,3" opacity="0.6"/>
            <text x="40" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#333">${ratio.toFixed(1)}</text>
            <text x="40" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#666" font-weight="600">Ratio</text>
          </g>
          
          <!-- Legend - positioned at bottom -->
          <g transform="translate(0, ${graphHeight + 10})">
            <rect x="0" y="0" width="10" height="10" fill="url(#doneGradient)" rx="1"/>
            <text x="15" y="8" font-family="Arial, sans-serif" font-size="11" fill="#666">Audits Done</text>
            <rect x="120" y="0" width="10" height="10" fill="url(#receivedGradient)" rx="1"/>
            <text x="135" y="8" font-family="Arial, sans-serif" font-size="11" fill="#666">Audits Received</text>
          </g>
        </g>
      </svg>
    `;
    
    container.innerHTML = svg;
  }, 10); // Small delay to ensure container is fully rendered
} 