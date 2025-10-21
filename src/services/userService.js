const BASE_URL = typeof process !== 'undefined' && process.env && process.env.VITE_API_URL
  ? process.env.VITE_API_URL
  : 'http://localhost:3001/api'

async function handleResponse(res) {
  const text = await res.text()
  try {
    const data = text ? JSON.parse(text) : null
    if (!res.ok) throw data || { message: res.statusText }
    return data
  } catch (err) {
    throw err
  }
}

export async function getUsers() {
  // default behavior: fetch all users
  const res = await fetch(`${BASE_URL}/users`)
  return handleResponse(res)
}

// new helper: fetch paginated users with optional search query
export async function getUsersPaged({ page = 1, limit = 10, q } = {}) {
  const params = new URLSearchParams()
  params.set('_page', String(page))
  params.set('_limit', String(limit))
  let url
  if (q) {
    // use dedicated filter endpoint for server-side search by email
    const p = new URLSearchParams()
    p.set('email', String(q))
    // do not send pagination params to the filter endpoint (server expects only email)
    url = `${BASE_URL}/users/filter?${p.toString()}`
  } else {
    if (params.toString()) url = `${BASE_URL}/users?${params.toString()}`
    else url = `${BASE_URL}/users`
  }
  const res = await fetch(url)
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch (err) {
    throw err
  }
  if (!res.ok) throw data || { message: res.statusText }

  // support multiple response shapes:
  // 1) plain array: [ {...}, ... ] and X-Total-Count header
  // 2) object: { data: [...], pagination: { _page, _limit, _totalRows } }
  let items = []
  let total = 0
  if (Array.isArray(data)) {
    items = data
    total = Number(res.headers.get('x-total-count') || items.length || 0)
  } else if (data && Array.isArray(data.data)) {
    items = data.data
    // prefer pagination._totalRows if present
    total = Number((data.pagination && data.pagination._totalRows) || res.headers.get('x-total-count') || items.length || 0)
  } else {
    // fallback
    items = Array.isArray(data) ? data : []
    total = Number(res.headers.get('x-total-count') || items.length || 0)
  }
  return { items, total }
}

export async function getUser(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`)
  return handleResponse(res)
}

export async function createUser(payload) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function updateUser(id, payload) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}
