import { graphqlRequest } from './api.js';

export async function fetchUserInfo() {
  const query = `{
    user {
      id
      login
    }
  }`;
  const data = await graphqlRequest(query);
  if (data.user && data.user.length > 0) {
    return data.user[0];
  }
  throw new Error('User info not found');
}

export function renderUserInfo(user) {
  const userInfoDiv = document.getElementById('user-info');
  userInfoDiv.innerHTML = `
    <h2>Welcome, ${user.login}</h2>
    <p><strong>User ID:</strong> ${user.id}</p>
  `;
} 