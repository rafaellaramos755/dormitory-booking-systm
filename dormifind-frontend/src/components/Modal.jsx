import React, { useEffect, useState } from 'react';

function Modal({ isOpen, onClose, title, children, imageUrl }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Close on Escape key
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Reset states when modal opens with new imageUrl
  useEffect(() => {
    if (isOpen && imageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {imageUrl ? (
            <>
              {imageLoading && <div className="modal-loading">Loading image...</div>}
              {imageError && <div className="modal-error">Failed to load image.</div>}
              <img
                src={`http://localhost/backend/${imageUrl}`}
                alt="Receipt"
                style={{ display: imageLoading ? 'none' : 'block', maxWidth: '100%', maxHeight: '70vh' }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            children
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
