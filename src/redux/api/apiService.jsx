const BASE = '/api';

async function fetchApi(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const categoriesApi = {
  getAll: () => fetchApi('/categories'),
  create: (body) =>
    fetchApi('/categories', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    fetchApi(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id) => fetchApi(`/categories/${id}`, { method: 'DELETE' }),
};

export const cardsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams();
    (params.categoryIds || []).forEach((id) => qs.append('categoryId', id));
    (params.stars || []).forEach((s) => qs.append('stars', s));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return fetchApi(`/cards${query}`);
  },
  create: (body) =>
    fetchApi('/cards', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    fetchApi(`/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id) => fetchApi(`/cards/${id}`, { method: 'DELETE' }),
};
