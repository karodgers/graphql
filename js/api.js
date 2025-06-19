// API utility functions

export function getJWT() {
  return localStorage.getItem('jwt');
}

export async function graphqlRequest(query, variables = {}) {
  const jwt = getJWT();
  if (!jwt) throw new Error('No JWT found');
  const response = await fetch('https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data;
} 