import { fetchUserInfo } from './user.js';
import { renderAuditRatioGraph } from './graphs/auditRatioGraph.js';
import { renderXPProgressGraph } from './graphs/xpProgressGraph.js';

function formatNumber(num, decimals = 2) {
  if (typeof num !== 'number') return num;
  return num % 1 === 0 ? num : num.toFixed(decimals);
}

function formatBytes(bytes) {
  if (bytes >= 1000000) {
    const mb = bytes / 1000000; // Direct conversion to MB
    return `${mb.toFixed(2)} MB`;
  } else if (bytes >= 1000) {
    const kb = bytes / 1000; // Direct conversion to KB
    return `${Math.round(kb)} KB`;
  } else {
    return `${bytes} B`;
  }
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.split(/\s|\./).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderDashboard({ user, xp, grades, auditsDone, auditsReceived, recentResults, xpTransactions }) {
  // Inject profile image, username, and user ID in header
  document.getElementById('profile-img').textContent = getInitials(user.login);
  document.getElementById('profile-username').textContent = user.login;
  document.getElementById('profile-userid').textContent = `ID: ${user.id}`;

  // Large blue card: Graphs with switching buttons
  document.querySelector('.property-card').innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%;">
      <!-- Graph switching buttons -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
        <button id="audit-ratio-btn" class="graph-btn active" style="background: rgba(255,255,255,0.2); color: #333; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease;">Audit Ratio</button>
        <button id="xp-progress-btn" class="graph-btn" style="background: rgba(255,255,255,0.1); color: #666; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease;">XP Progress</button>
      </div>
      <!-- Graph container -->
      <div id="graphql-graphs" style="flex: 1; display: flex; align-items: center; justify-content: center; height: 280px; min-height: 280px; max-height: 280px; overflow: hidden; padding: 10px;"></div>
    </div>
  `;
  
  // Initialize with audit ratio graph
  renderGraphs('audit-ratio', xp, grades, auditsDone, auditsReceived, user.auditRatio, xpTransactions);
  
  // Add button event listeners
  document.getElementById('audit-ratio-btn').addEventListener('click', () => {
    switchGraph('audit-ratio', xp, grades, auditsDone, auditsReceived, user.auditRatio, xpTransactions);
  });
  
  document.getElementById('xp-progress-btn').addEventListener('click', () => {
    switchGraph('xp-progress', xp, grades, auditsDone, auditsReceived, user.auditRatio, xpTransactions);
  });

  // Rental Index Card → XP (no dummy bars/percentages)
  document.querySelectorAll('.metric-card')[0].innerHTML = `
    <div class="metric-title">Total XP</div>
    <div style="font-size: 12px; color: #666; margin-bottom: 20px;">Your accumulated experience points</div>
    <div class="metric-value">${formatBytes(xp)}</div>
  `;

  // Revenue Card → Audits Done (no dummy donut, just numbers)
  document.querySelector('.revenue-card').innerHTML = `
    <div class="metric-title" style="color: #333;">Audits Done</div>
    <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Total audits you have performed</div>
    <div style="font-size: 2.5rem; font-weight: 700; text-align:center;">${auditsDone.total}</div>
    <div style="text-align: center; margin-top: 10px;">
      <span style="color:#00d4aa; font-weight:600;">Passed: ${auditsDone.passed}</span> &nbsp;|&nbsp; <span style="color:#ff6b6b; font-weight:600;">Failed: ${auditsDone.failed}</span>
    </div>
  `;

  // Spaces Card → Audits Received 
  const auditsReceivedCard = document.querySelectorAll('.card')[3];
  if (auditsReceivedCard && auditsReceivedCard.classList.contains('campus-card') === false) {
    auditsReceivedCard.innerHTML = `
      <div class="metric-title">Audits Received</div>
      <div style="font-size: 12px; color: #666; margin-bottom: 15px;">Audits performed on your work</div>
      <div style="font-size: 2.5rem; font-weight: 700; text-align:center;">${auditsReceived.total}</div>
      <div style="text-align: center; margin-top: 10px;">
        <span style="color:#00d4aa; font-weight:600;">Passed: ${auditsReceived.passed}</span> &nbsp;|&nbsp; <span style="color:#ff6b6b; font-weight:600;">Failed: ${auditsReceived.failed}</span>
      </div>
    `;
  }

  // Campus Card
  const campusCard = document.querySelector('.campus-card');
  if (campusCard) {
    document.getElementById('campus-name').textContent = `Campus: ${user.campus || 'N/A'}`;
    document.getElementById('joined-date').textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
  }

  // Bottom section recent results 
  const bottomCards = document.querySelectorAll('.bottom-section .card');
  if (bottomCards[0]) {
    bottomCards[0].innerHTML = `
      <div style="font-weight: 600; margin-bottom: 10px;">Recent Grades</div>
      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Last 5 grades</div>
      <ul style="padding-left: 1.2em; margin: 0; list-style: none; text-align:center;">
        ${grades.map(g => `<li style="margin-bottom:8px;padding:4px 0;border-bottom:1px solid #eee;font-size:1.08rem;color:#222;display:inline-block;width:100%;text-align:center;"><span style='font-weight:600;'>${formatNumber(g.grade)}</span> - <span style='color:#667eea;'>${g.path.split('/').pop()}</span></li>`).join('')}
      </ul>
    `;
  }
  if (bottomCards[1]) {
    bottomCards[1].innerHTML = `
      <div style="font-weight: 600; margin-bottom: 10px;">Recent Projects</div>
      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Last 5 Projects</div>
      <ul style="padding-left: 1.2em; margin: 0; list-style: none; text-align:center;">
        ${recentResults.map(r => `<li style="margin-bottom:8px;padding:4px 0;border-bottom:1px solid #eee;font-size:1.08rem;color:#222;display:inline-block;width:100%;text-align:center;"><span style='font-weight:600;'>${formatNumber(r.grade)}</span> - <span style='color:#764ba2;'>${r.path.split('/').pop()}</span></li>`).join('')}
      </ul>
    `;
  }

  // Logout button functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('jwt');
      window.location.href = '../html/login.html';
    };
  }
}

function renderGraphs(graphType, xp, grades, auditsDone, auditsReceived, auditRatio, xpTransactions) {
  const graphContainer = document.getElementById('graphql-graphs');
  
  switch(graphType) {
    case 'audit-ratio':
      renderAuditRatioGraph(graphContainer, auditsDone, auditsReceived, auditRatio);
      break;
    case 'xp-progress':
      renderXPProgressGraph(graphContainer, xpTransactions, 'week');
      break;
    default:
      renderAuditRatioGraph(graphContainer, auditsDone, auditsReceived, auditRatio);
  }
}

function switchGraph(graphType, xp, grades, auditsDone, auditsReceived, auditRatio, xpTransactions) {
  // Update button styles
  document.querySelectorAll('.graph-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = 'rgba(255,255,255,0.1)';
    btn.style.color = '#666';
  });
  
  const activeBtn = document.getElementById(`${graphType.replace('-', '-')}-btn`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.background = 'rgba(255,255,255,0.2)';
    activeBtn.style.color = '#333';
  }
  
  // Render the selected graph
  renderGraphs(graphType, xp, grades, auditsDone, auditsReceived, auditRatio, xpTransactions);
}

// Main render
import('./user.js').then(({ fetchUserInfo }) => {
  fetchUserInfo().then(renderDashboard);
}); 