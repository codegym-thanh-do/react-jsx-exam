import React, { useEffect, useMemo, useState } from 'react'
import { getUsersPaged, deleteUser } from '../services/userService'
import UserForm from './UserForm'
import Modal from './Modal'

export default function UsersList({ onSelect }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [editingUserId, setEditingUserId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'danger', message }
  const [deleteCandidate, setDeleteCandidate] = useState(null) // { id, name }
  const [deleting, setDeleting] = useState(false)

  // auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(id)
  }, [toast])

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

  function promptDelete(id, name) {
    setDeleteCandidate({ id, name })
  }

  function cancelDelete() {
    setDeleteCandidate(null)
    setDeleting(false)
  }

  async function confirmDelete() {
    if (!deleteCandidate) return
    setDeleting(true)
    try {
      await deleteUser(deleteCandidate.id)
      setToast({ type: 'success', message: 'User deleted successfully' })
      cancelDelete()
      // refresh list (keep current page)
      getUsersPaged({ page, limit: pageSize, q: query }).then(({ items, total }) => {
        setUsers(items)
        setTotal(total)
      }).catch(err => setError(err))
    } catch (err) {
      setToast({ type: 'danger', message: String(err?.message || 'Delete failed') })
      setDeleting(false)
    }
  }

  function handleEdit(id) {
    setEditingUserId(id)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingUserId(null)
  }

  // autofocus first input when modal opened
  useEffect(() => {
    if (!showModal) return
    const t = setTimeout(() => {
      const input = document.querySelector('.modal input, .modal select, .modal textarea')
      if (input) input.focus()
    }, 50)
    return () => clearTimeout(t)
  }, [showModal])

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
    <>
    <div className="container my-4">
      <div className="card shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between">
            <div>
              <h5 className="mb-0">Users</h5>
              <small className="text-muted">List of registered users</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-success" onClick={() => { setEditingUserId(null); setShowModal(true) }}>Add user</button>
              <div className="text-muted small">Total: {total}</div>
            </div>
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
                  <th scope="col"></th>
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
                            <button className="btn btn-sm btn-primary" onClick={() => handleEdit(u.id)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => promptDelete(u.id, u.name)}>Delete</button>
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
    {showModal && (
      <Modal onClose={closeModal}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editingUserId ? 'Edit User' : 'Create User'}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <UserForm userId={editingUserId} onSaved={(result) => {
                if (result && result.success) {
                  const msg = result.mode === 'create' ? 'User created successfully' : 'User updated successfully'
                  setToast({ type: 'success', message: msg })
                } else {
                  const op = result?.mode === 'create' ? 'creation' : 'update'
                  setToast({ type: 'danger', message: String(result?.error?.message || `User ${op} failed`) })
                }
                closeModal();
                /* refresh list */ setPage(1); getUsersPaged({ page: 1, limit: pageSize, q: query }).then(({ items, total }) => { setUsers(items); setTotal(total) }).catch(err => setError(err))
              }} />
            </div>
          </div>
        </div>
      </Modal>
    )}

    {deleteCandidate && (
      <Modal onClose={cancelDelete}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm delete</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={cancelDelete}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user <strong>{deleteCandidate.name}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelDelete} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      </Modal>
    )}

    {/* Toast container */}
    <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', top: 12, right: 12, zIndex: 2000 }}>
      {toast && (
        <div className={`toast show text-white bg-${toast.type}`} role="alert" aria-live="assertive" aria-atomic="true" style={{ minWidth: 240 }}>
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setToast(null)}></button>
          </div>
        </div>
      )}
    </div>
    </>
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

