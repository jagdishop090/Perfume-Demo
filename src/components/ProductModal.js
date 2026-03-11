import './ProductModal.css';

const ProductModal = ({ product, isOpen, onClose, mode }) => {
  if (!isOpen || !product) return null;

  const handleOrderNow = () => {
    // Create WhatsApp message with product details
    const message = `Hi! I'm interested in ordering ${product.name} (${product.price}). Please provide more details about availability and delivery.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918788524747?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Close the modal
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`modal-overlay ${mode}-modal`} onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-body">
          <div className="modal-image-section">
            {product.image && (
              <div className="modal-image-container">
                <img src={product.image} alt={product.name} className="modal-product-image" />
              </div>
            )}
            {product.isFeatured && (
              <div className="modal-featured-badge">Featured</div>
            )}
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
                  that captures the perfect balance of elegance and allure. This premium scent 
                  features carefully selected notes that create a memorable and distinctive aroma.
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="order-now-btn" onClick={handleOrderNow}>
                ORDER NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;