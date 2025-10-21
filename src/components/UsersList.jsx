import React, { useEffect, useMemo, useState } from 'react'
import { getUsersPaged, deleteUser } from '../services/userService'

export default function UsersList({ onSelect }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    // fetch paginated users from server API
    getUsersPaged({ page, limit: pageSize, q: query })
      .then(({ items, total }) => {
        if (!mounted) return
        setUsers(items)
        setTotal(Number(total) || 0)
      })
      .catch(err => mounted && setError(err))
      .finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [page, pageSize, query])

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return
    try {
      await deleteUser(id)
      setUsers(u => u.filter(x => x.id !== id))
    } catch (err) {
      alert(err?.message || 'Delete failed')
    }
  }

  // server provides total
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, pageSize])

  const paged = users

  if (loading) return <div className="p-4">Loading users…</div>
  if (error) return <div className="p-4 text-danger">Error: {String(error?.message || error)}</div>

  function renderPageNumbers() {
    const pages = []
    const maxButtons = 7
    let start = Math.max(1, page - Math.floor(maxButtons / 2))
    let end = Math.min(totalPages, start + maxButtons - 1)
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return (
      <div className="btn-group" role="group" aria-label="pagination">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(1)} disabled={page === 1}>{'<<'}</button>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{'<'}</button>
        {pages.map(p => (
          <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{'>'}</button>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(totalPages)} disabled={page === totalPages}>{'>>'}</button>
      </div>
    )
  }

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between">
            <div>
              <h5 className="mb-0">Users</h5>
              <small className="text-muted">List of registered users</small>
            </div>
            <div className="text-muted small">Total: {total}</div>
          </div>
          <div className="card-body">
          <div className="d-md-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <label className="me-2">
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }} className="form-select form-select-sm">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <div className="small text-muted">entries per page</div>
            </div>

            <div className="mt-2 mt-md-0">
              <div className="input-group input-group-sm">
                <span className="input-group-text">Search</span>
                <input type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} className="form-control" />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Birthday</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">No users found</td>
                    </tr>
                  ) : (
                    paged.map((u, idx) => (
                      <tr key={u.id}>
                        <th scope="row">{(page - 1) * pageSize + idx + 1}</th>
                        <td>{u.name || '-'}</td>
                        <td>{u.email || '-'}</td>
                        <td>{formatBirthday(u.birthday)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-primary" onClick={() => onSelect?.(u.id)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
            </table>
          </div>

            <div className="d-md-flex align-items-center justify-content-between mt-3">
              <div className="small text-muted">Showing {(total === 0) ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} entries</div>
              <div className="mt-2 mt-md-0">{renderPageNumbers()}</div>
            </div>
        </div>
      </div>
    </div>
  )
}

function formatBirthday(value) {
  if (!value) return '-'
  // Accept either ISO string or timestamp or yyyy-mm-dd
  const date = new Date(value)
  if (isNaN(date.getTime())) return String(value)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

