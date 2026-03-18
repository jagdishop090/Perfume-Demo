import React, { useState } from 'react';
import './ProductModal.css';

const ProductModal = ({ product, isOpen, onClose, mode }) => {
  const [activeImg, setActiveImg] = useState(0);

  if (!isOpen || !product) return null;

  // Build full image list: main + extras
  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images || [])
  ].filter(Boolean);

  const handleOrderNow = () => {
    const message = `Hi! I'm interested in ordering ${product.name} (${product.price}). Please provide more details about availability and delivery.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/918788524747?text=${encodedMessage}`, '_blank');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={`modal-overlay ${mode}-modal`} onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-body">
          <div className="modal-image-section">
            {allImages.length > 0 ? (
              <>
                <div className="modal-image-container">
                  <img src={allImages[activeImg]} alt={product.name} className="modal-product-image" />
                </div>
                {allImages.length > 1 && (
                  <div className="modal-thumbnails">
                    {allImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`view-${i}`}
                        className={`modal-thumb ${i === activeImg ? 'active' : ''}`}
                        onClick={() => setActiveImg(i)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : null}
            {product.isFeatured && <div className="modal-featured-badge">Featured</div>}
          </div>

          <div className="modal-details">
            <div className="modal-header">
              <h2 className="modal-title">{product.name}</h2>
              <div className="modal-price">{product.price}</div>
            </div>

            <div className="modal-info">
              <div className="modal-section">
                <h3>Fragrance Notes</h3>
                <p className="modal-notes">{product.notes}</p>
              </div>

              <div className="modal-section">
                <h3>Product Details</h3>
                <div className="modal-specs">
                  <div className="spec-item">
                    <span className="spec-label">Volume:</span>
                    <span className="spec-value">50ml / 1.7 fl oz</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Type:</span>
                    <span className="spec-value">Eau de Parfum</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Longevity:</span>
                    <span className="spec-value">6-8 hours</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Description</h3>
                <p className="modal-description">
                  Experience the luxurious essence of {product.name}, a sophisticated fragrance
                  that captures the perfect balance of elegance and allure.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="order-now-btn" onClick={handleOrderNow}>ORDER NOW</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
