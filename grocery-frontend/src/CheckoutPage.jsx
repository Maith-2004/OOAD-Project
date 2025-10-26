import API_BASE_URL from './config/api';
import React, { useState } from 'react';
import API_BASE_URL from './config/api';
import PaymentMethodSelector from './PaymentMethodSelector';
import API_BASE_URL from './config/api';
import './CheckoutPage.css';
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
/**
import API_BASE_URL from './config/api';
 * Checkout Page Component
import API_BASE_URL from './config/api';
 * Integrated with Payment Method Selector
import API_BASE_URL from './config/api';
 * Handles order placement with both cash and bank payment
import API_BASE_URL from './config/api';
 */
import API_BASE_URL from './config/api';
const CheckoutPage = ({ cartItems, totalAmount, customerId }) => {
import API_BASE_URL from './config/api';
  const [deliveryAddress, setDeliveryAddress] = useState('');
import API_BASE_URL from './config/api';
  const [paymentMethod, setPaymentMethod] = useState('cash');
import API_BASE_URL from './config/api';
  const [receiptFile, setReceiptFile] = useState(null);
import API_BASE_URL from './config/api';
  const [loading, setLoading] = useState(false);
import API_BASE_URL from './config/api';
  const [orderStatus, setOrderStatus] = useState(null);
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
  const handlePlaceOrder = async () => {
import API_BASE_URL from './config/api';
    // Validation
import API_BASE_URL from './config/api';
    if (!deliveryAddress.trim()) {
import API_BASE_URL from './config/api';
      alert('Please enter delivery address');
import API_BASE_URL from './config/api';
      return;
import API_BASE_URL from './config/api';
    }
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
    if (paymentMethod === 'bank' && !receiptFile) {
import API_BASE_URL from './config/api';
      alert('Please upload payment receipt');
import API_BASE_URL from './config/api';
      return;
import API_BASE_URL from './config/api';
    }
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
    setLoading(true);
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
    try {
import API_BASE_URL from './config/api';
      let receiptFileName = null;
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      // If bank payment, upload receipt first
import API_BASE_URL from './config/api';
      if (paymentMethod === 'bank' && receiptFile) {
import API_BASE_URL from './config/api';
        receiptFileName = await uploadReceipt(receiptFile);
import API_BASE_URL from './config/api';
      }
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      // Prepare order data
import API_BASE_URL from './config/api';
      const orderData = {
import API_BASE_URL from './config/api';
        customerId: customerId,
import API_BASE_URL from './config/api';
        items: cartItems.map(item => ({
import API_BASE_URL from './config/api';
          productId: item.productId,
import API_BASE_URL from './config/api';
          quantity: item.quantity,
import API_BASE_URL from './config/api';
          price: item.price
import API_BASE_URL from './config/api';
        })),
import API_BASE_URL from './config/api';
        delivery_address: deliveryAddress,
import API_BASE_URL from './config/api';
        paymentMethod: paymentMethod,
import API_BASE_URL from './config/api';
        ...(paymentMethod === 'bank' && { paymentReceipt: receiptFileName })
import API_BASE_URL from './config/api';
      };
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      // Place order
import API_BASE_URL from './config/api';
      const response = await fetch('\/api/orders', {
import API_BASE_URL from './config/api';
        method: 'POST',
import API_BASE_URL from './config/api';
        headers: {
import API_BASE_URL from './config/api';
          'Content-Type': 'application/json',
import API_BASE_URL from './config/api';
        },
import API_BASE_URL from './config/api';
        body: JSON.stringify(orderData)
import API_BASE_URL from './config/api';
      });
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      const result = await response.json();
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      if (result.error) {
import API_BASE_URL from './config/api';
        throw new Error(result.error);
import API_BASE_URL from './config/api';
      }
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      // Show success message based on payment method
import API_BASE_URL from './config/api';
      if (paymentMethod === 'cash') {
import API_BASE_URL from './config/api';
        setOrderStatus({
import API_BASE_URL from './config/api';
          type: 'success',
import API_BASE_URL from './config/api';
          message: 'Order placed successfully!',
import API_BASE_URL from './config/api';
          orderId: result.orderId,
import API_BASE_URL from './config/api';
          status: result.status,
import API_BASE_URL from './config/api';
          deliveryEmployee: result.deliveryEmployee
import API_BASE_URL from './config/api';
        });
import API_BASE_URL from './config/api';
      } else {
import API_BASE_URL from './config/api';
        setOrderStatus({
import API_BASE_URL from './config/api';
          type: 'pending',
import API_BASE_URL from './config/api';
          message: 'Order submitted for payment review!',
import API_BASE_URL from './config/api';
          orderId: result.orderId,
import API_BASE_URL from './config/api';
          status: result.status
import API_BASE_URL from './config/api';
        });
import API_BASE_URL from './config/api';
      }
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      // Clear cart (implement your cart clearing logic)
import API_BASE_URL from './config/api';
      // clearCart();
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
    } catch (error) {
import API_BASE_URL from './config/api';
      alert('Failed to place order: ' + error.message);
import API_BASE_URL from './config/api';
    } finally {
import API_BASE_URL from './config/api';
      setLoading(false);
import API_BASE_URL from './config/api';
    }
import API_BASE_URL from './config/api';
  };
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
  const uploadReceipt = async (file) => {
import API_BASE_URL from './config/api';
    // Create FormData for file upload
import API_BASE_URL from './config/api';
    const formData = new FormData();
import API_BASE_URL from './config/api';
    formData.append('receipt', file);
import API_BASE_URL from './config/api';
    formData.append('customerId', customerId);
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
    try {
import API_BASE_URL from './config/api';
      const response = await fetch('\/api/files/upload', {
import API_BASE_URL from './config/api';
        method: 'POST',
import API_BASE_URL from './config/api';
        body: formData
import API_BASE_URL from './config/api';
      });
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      const result = await response.json();
import API_BASE_URL from './config/api';
      
import API_BASE_URL from './config/api';
      if (result.error) {
import API_BASE_URL from './config/api';
        throw new Error(result.error);
import API_BASE_URL from './config/api';
      }
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      return result.filename || file.name;
import API_BASE_URL from './config/api';
    } catch (error) {
import API_BASE_URL from './config/api';
      // If file upload endpoint not implemented, use filename
import API_BASE_URL from './config/api';
      console.warn('File upload failed, using filename:', error);
import API_BASE_URL from './config/api';
      return `receipt_${Date.now()}_${file.name}`;
import API_BASE_URL from './config/api';
    }
import API_BASE_URL from './config/api';
  };
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
  if (orderStatus) {
import API_BASE_URL from './config/api';
    return (
import API_BASE_URL from './config/api';
      <div className="checkout-page">
import API_BASE_URL from './config/api';
        <div className="order-confirmation">
import API_BASE_URL from './config/api';
          {orderStatus.type === 'success' ? (
import API_BASE_URL from './config/api';
            <>
import API_BASE_URL from './config/api';
              <div className="success-icon">✓</div>
import API_BASE_URL from './config/api';
              <h2>Order Placed Successfully!</h2>
import API_BASE_URL from './config/api';
              <div className="order-details">
import API_BASE_URL from './config/api';
                <p><strong>Order ID:</strong> {orderStatus.orderId}</p>
import API_BASE_URL from './config/api';
                <p><strong>Status:</strong> {orderStatus.status}</p>
import API_BASE_URL from './config/api';
                <p><strong>Delivery Employee:</strong> {orderStatus.deliveryEmployee}</p>
import API_BASE_URL from './config/api';
                <p><strong>Total:</strong> Rs. {totalAmount.toFixed(2)}</p>
import API_BASE_URL from './config/api';
              </div>
import API_BASE_URL from './config/api';
              <p className="info-message">
import API_BASE_URL from './config/api';
                Your order will be delivered soon!
import API_BASE_URL from './config/api';
              </p>
import API_BASE_URL from './config/api';
            </>
import API_BASE_URL from './config/api';
          ) : (
import API_BASE_URL from './config/api';
            <>
import API_BASE_URL from './config/api';
              <div className="pending-icon">⏳</div>
import API_BASE_URL from './config/api';
              <h2>Order Submitted for Review</h2>
import API_BASE_URL from './config/api';
              <div className="order-details">
import API_BASE_URL from './config/api';
                <p><strong>Order ID:</strong> {orderStatus.orderId}</p>
import API_BASE_URL from './config/api';
                <p><strong>Status:</strong> Payment Review</p>
import API_BASE_URL from './config/api';
                <p><strong>Total:</strong> Rs. {totalAmount.toFixed(2)}</p>
import API_BASE_URL from './config/api';
              </div>
import API_BASE_URL from './config/api';
              <p className="info-message">
import API_BASE_URL from './config/api';
                Your payment receipt is being verified. You'll receive confirmation 
import API_BASE_URL from './config/api';
                once approved. Please check your order history for updates.
import API_BASE_URL from './config/api';
              </p>
import API_BASE_URL from './config/api';
            </>
import API_BASE_URL from './config/api';
          )}
import API_BASE_URL from './config/api';
          <button 
import API_BASE_URL from './config/api';
            className="btn-primary"
import API_BASE_URL from './config/api';
            onClick={() => window.location.href = '/orders'}
import API_BASE_URL from './config/api';
          >
import API_BASE_URL from './config/api';
            View Order History
import API_BASE_URL from './config/api';
          </button>
import API_BASE_URL from './config/api';
        </div>
import API_BASE_URL from './config/api';
      </div>
import API_BASE_URL from './config/api';
    );
import API_BASE_URL from './config/api';
  }
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
  return (
import API_BASE_URL from './config/api';
    <div className="checkout-page">
import API_BASE_URL from './config/api';
      <h1>Checkout</h1>
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      {/* Order Summary */}
import API_BASE_URL from './config/api';
      <div className="order-summary">
import API_BASE_URL from './config/api';
        <h3>Order Summary</h3>
import API_BASE_URL from './config/api';
        <div className="items-list">
import API_BASE_URL from './config/api';
          {cartItems.map((item, index) => (
import API_BASE_URL from './config/api';
            <div key={index} className="item-row">
import API_BASE_URL from './config/api';
              <span>{item.name} × {item.quantity}</span>
import API_BASE_URL from './config/api';
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
import API_BASE_URL from './config/api';
            </div>
import API_BASE_URL from './config/api';
          ))}
import API_BASE_URL from './config/api';
        </div>
import API_BASE_URL from './config/api';
        <div className="total-row">
import API_BASE_URL from './config/api';
          <strong>Total</strong>
import API_BASE_URL from './config/api';
          <strong>Rs. {totalAmount.toFixed(2)}</strong>
import API_BASE_URL from './config/api';
        </div>
import API_BASE_URL from './config/api';
      </div>
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      {/* Delivery Address */}
import API_BASE_URL from './config/api';
      <div className="delivery-section">
import API_BASE_URL from './config/api';
        <h3>Delivery Address</h3>
import API_BASE_URL from './config/api';
        <textarea
import API_BASE_URL from './config/api';
          className="address-input"
import API_BASE_URL from './config/api';
          placeholder="Enter your delivery address..."
import API_BASE_URL from './config/api';
          value={deliveryAddress}
import API_BASE_URL from './config/api';
          onChange={(e) => setDeliveryAddress(e.target.value)}
import API_BASE_URL from './config/api';
          rows="4"
import API_BASE_URL from './config/api';
        />
import API_BASE_URL from './config/api';
      </div>
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      {/* Payment Method Selector */}
import API_BASE_URL from './config/api';
      <PaymentMethodSelector
import API_BASE_URL from './config/api';
        onPaymentMethodChange={setPaymentMethod}
import API_BASE_URL from './config/api';
        onReceiptChange={setReceiptFile}
import API_BASE_URL from './config/api';
      />
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
      {/* Place Order Button */}
import API_BASE_URL from './config/api';
      <div className="checkout-actions">
import API_BASE_URL from './config/api';
        <button
import API_BASE_URL from './config/api';
          className="btn-place-order"
import API_BASE_URL from './config/api';
          onClick={handlePlaceOrder}
import API_BASE_URL from './config/api';
          disabled={loading}
import API_BASE_URL from './config/api';
        >
import API_BASE_URL from './config/api';
          {loading ? 'Processing...' : 'Place Order'}
import API_BASE_URL from './config/api';
        </button>
import API_BASE_URL from './config/api';
      </div>
import API_BASE_URL from './config/api';
    </div>
import API_BASE_URL from './config/api';
  );
import API_BASE_URL from './config/api';
};
import API_BASE_URL from './config/api';

import API_BASE_URL from './config/api';
export default CheckoutPage;


