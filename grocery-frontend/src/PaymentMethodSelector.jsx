import React, { useState } from 'react';
import './PaymentMethodSelector.css';

/**
 * Payment Method Selector Component
 * Allows customers to choose between Cash on Delivery and Bank Payment
 * Shows file upload input when Bank Payment is selected
 */
const PaymentMethodSelector = ({ onPaymentMethodChange, onReceiptChange }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    
    // Reset receipt when switching to cash
    if (method === 'cash') {
      setReceiptFile(null);
      setReceiptPreview(null);
      onReceiptChange(null);
    }
    
    onPaymentMethodChange(method);
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setReceiptFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);

      onReceiptChange(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    onReceiptChange(null);
  };

  return (
    <div className="payment-method-selector">
      <h3>Select Payment Method</h3>
      
      <div className="payment-options">
        <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === 'cash'}
            onChange={handlePaymentMethodChange}
          />
          <div className="option-content">
            <span className="option-icon">💵</span>
            <div className="option-text">
              <strong>Cash on Delivery</strong>
              <p>Pay with cash when your order arrives</p>
            </div>
          </div>
        </label>

        <label className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="bank"
            checked={paymentMethod === 'bank'}
            onChange={handlePaymentMethodChange}
          />
          <div className="option-content">
            <span className="option-icon">🏦</span>
            <div className="option-text">
              <strong>Bank Payment</strong>
              <p>Upload payment receipt for verification</p>
            </div>
          </div>
        </label>
      </div>

      {/* Bank Payment Receipt Upload */}
      {paymentMethod === 'bank' && (
        <div className="receipt-upload-section">
          <div className="bank-details">
            <h4>Bank Account Details</h4>
            <p><strong>Bank Name:</strong> ABC Bank</p>
            <p><strong>Account Number:</strong> 1234567890</p>
            <p><strong>Account Name:</strong> Grocery Store Ltd.</p>
            <p className="info-text">
              ℹ️ Please transfer the total amount and upload the payment receipt below
            </p>
          </div>

          {!receiptFile ? (
            <div className="upload-area">
              <label htmlFor="receipt-upload" className="upload-label">
                <div className="upload-icon">📎</div>
                <p className="upload-text">Click to upload payment receipt</p>
                <p className="upload-hint">JPG, PNG (Max 5MB)</p>
              </label>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="file-input"
              />
            </div>
          ) : (
            <div className="receipt-preview">
              <h4>Payment Receipt</h4>
              <div className="preview-container">
                <img src={receiptPreview} alt="Receipt preview" />
                <button 
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="remove-btn"
                >
                  ✕ Remove
                </button>
              </div>
              <p className="file-name">{receiptFile.name}</p>
            </div>
          )}

          <div className="bank-payment-notice">
            <strong>⚠️ Important:</strong> Your order will be reviewed by our payment team. 
            You'll receive confirmation once the payment is verified.
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
