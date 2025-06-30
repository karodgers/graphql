import { graphqlRequest } from './api.js';

function formatProfile(profile) {
  if (!profile) return 'N/A';
  if (typeof profile === 'string') {
    try {
      profile = JSON.parse(profile);
    } catch {
      return profile;
    }
  }
  // Display key info from profile object
  return Object.entries(profile)
    .map(([key, value]) => `<span class="profile-field"><strong>${key}:</strong> ${value}</span>`)
    .join('<br>');
}

function formatNumber(num, decimals = 2) {
  if (typeof num !== 'number') return num;
  return num % 1 === 0 ? num : num.toFixed(decimals);
}

export async function fetchUserInfo() {
  const query = `{
    user {
      id
      login
      profile
      createdAt
      campus
      auditRatio
    }
    transaction(where: {type: {_eq: "xp"}, eventId: {_eq: 75}}, order_by: {createdAt: asc}) {
      amount
      createdAt
    }
    progress(order_by: {createdAt: desc}, limit: 5) {
      grade
      createdAt
      path
    }
    audit {
      id
      grade
      createdAt
      auditorId
    }
    result(order_by: {createdAt: desc}, limit: 5) {
      grade
      type
      path
      isLast
      createdAt
    }
  }`;
  const data = await graphqlRequest(query);
  if (!data.user || data.user.length === 0) throw new Error('User info not found');
  const user = data.user[0];
  const userId = user.id;

  // Filter audits
  const auditsDone = data.audit.filter(a => a.auditorId === userId);
  const auditsReceived = data.audit.filter(a => a.auditorId !== userId);

  return {
    user,
    xp: sumUserXP(data.transaction),
    xpTransactions: data.transaction,
    grades: data.progress,
    auditsDone: auditStats(auditsDone),
    auditsReceived: auditStats(auditsReceived),
    recentResults: data.result
  };
}

function sumUserXP(transactions) {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

function auditStats(audits) {
  let passed = 0, failed = 0;
  audits.forEach(a => {
    if (a.grade >= 1) passed++;
    else failed++;
  });
  return { total: audits.length, passed, failed };
}
