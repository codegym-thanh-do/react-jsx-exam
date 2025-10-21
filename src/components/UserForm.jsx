import React, { useEffect, useState } from 'react'
import { createUser, getUser, updateUser } from '../services/userService'

export default function UserForm({ userId, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', birthday: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    if (userId) {
      setLoading(true)
      getUser(userId)
        .then(data => mounted && setForm({
          name: data.name || '',
          email: data.email || '',
          birthday: data.birthday || '',
          password: data.password || ''
        }))
        .catch(err => mounted && setError(err))
        .finally(() => mounted && setLoading(false))
    } else {
      setForm({ name: '', email: '', birthday: '', password: '' })
    }
    return () => (mounted = false)
  }, [userId])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (userId) await updateUser(userId, form)
      else await createUser(form)
      const res = { success: true }
      onSaved && onSaved(res)
    } catch (err) {
      setError(err)
      const res = { success: false, error: err }
      onSaved && onSaved(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{String(error?.message || error)}</div>}
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-control" />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-control" />
      </div>
      <div className="mb-3">
        <label className="form-label">Birthday</label>
        <input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} className="form-control" />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-control" />
      </div>
      <div>
        <button type="submit" className="btn btn-primary">{loading ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  )
}
