import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ children, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return createPortal(
    <>
      <div className="modal fade show" style={{ display: 'block', zIndex: 1060 }} role="dialog">
        {children}
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
    </>,
    document.body
  )
}
