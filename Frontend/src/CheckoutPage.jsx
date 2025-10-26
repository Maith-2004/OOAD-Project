import React, { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import './CheckoutPage.css';

/**
 * Checkout Page Component
 * Integrated with Payment Method Selector
 * Handles order placement with both cash and bank payment
 */
const CheckoutPage = ({ cartItems, totalAmount, customerId }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  const handlePlaceOrder = async () => {
    // Validation
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }

    if (paymentMethod === 'bank' && !receiptFile) {
      alert('Please upload payment receipt');
      return;
    }

    setLoading(true);

    try {
      let receiptFileName = null;

      // If bank payment, upload receipt first
      if (paymentMethod === 'bank' && receiptFile) {
        receiptFileName = await uploadReceipt(receiptFile);
      }

      // Prepare order data
      const orderData = {
        customerId: customerId,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        delivery_address: deliveryAddress,
        paymentMethod: paymentMethod,
        ...(paymentMethod === 'bank' && { paymentReceipt: receiptFileName })
      };

      // Place order
      const response = await fetch('http://localhost:8081/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Show success message based on payment method
      if (paymentMethod === 'cash') {
        setOrderStatus({
          type: 'success',
          message: 'Order placed successfully!',
          orderId: result.orderId,
          status: result.status,
          deliveryEmployee: result.deliveryEmployee
        });
      } else {
        setOrderStatus({
          type: 'pending',
          message: 'Order submitted for payment review!',
          orderId: result.orderId,
          status: result.status
        });
      }

      // Clear cart (implement your cart clearing logic)
      // clearCart();

    } catch (error) {
      alert('Failed to place order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadReceipt = async (file) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('customerId', customerId);

    try {
      const response = await fetch('http://localhost:8081/api/files/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.filename || file.name;
    } catch (error) {
      // If file upload endpoint not implemented, use filename
      console.warn('File upload failed, using filename:', error);
      return `receipt_${Date.now()}_${file.name}`;
    }
  };

  if (orderStatus) {
    return (
      <div className="checkout-page">
        <div className="order-confirmation">
          {orderStatus.type === 'success' ? (
            <>
              <div className="success-icon">✓</div>
              <h2>Order Placed Successfully!</h2>
              <div className="order-details">
                <p><strong>Order ID:</strong> {orderStatus.orderId}</p>
                <p><strong>Status:</strong> {orderStatus.status}</p>
                <p><strong>Delivery Employee:</strong> {orderStatus.deliveryEmployee}</p>
                <p><strong>Total:</strong> Rs. {totalAmount.toFixed(2)}</p>
              </div>
              <p className="info-message">
                Your order will be delivered soon!
              </p>
            </>
          ) : (
            <>
              <div className="pending-icon">⏳</div>
              <h2>Order Submitted for Review</h2>
              <div className="order-details">
                <p><strong>Order ID:</strong> {orderStatus.orderId}</p>
                <p><strong>Status:</strong> Payment Review</p>
                <p><strong>Total:</strong> Rs. {totalAmount.toFixed(2)}</p>
              </div>
              <p className="info-message">
                Your payment receipt is being verified. You'll receive confirmation 
                once approved. Please check your order history for updates.
              </p>
            </>
          )}
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/orders'}
          >
            View Order History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="items-list">
          {cartItems.map((item, index) => (
            <div key={index} className="item-row">
              <span>{item.name} × {item.quantity}</span>
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="total-row">
          <strong>Total</strong>
          <strong>Rs. {totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="delivery-section">
        <h3>Delivery Address</h3>
        <textarea
          className="address-input"
          placeholder="Enter your delivery address..."
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          rows="4"
        />
      </div>

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        onPaymentMethodChange={setPaymentMethod}
        onReceiptChange={setReceiptFile}
      />

      {/* Place Order Button */}
      <div className="checkout-actions">
        <button
          className="btn-place-order"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
