import React, { useState, useEffect } from 'react';
import './CustomerOrderHistory.css';

/**
 * Customer Order History Component
 * Shows all customer orders with payment status
 */
const CustomerOrderHistory = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, placed, cancelled

  useEffect(() => {
    fetchOrders();
  }, [customerId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/users/${customerId}/orders`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PLACED': { class: 'badge-success', text: 'Placed' },
      'PAYMENT_REVIEW': { class: 'badge-warning', text: 'Payment Review' },
      'CANCELLED': { class: 'badge-danger', text: 'Cancelled' },
      'DELIVERED': { class: 'badge-info', text: 'Delivered' }
    };

    const config = statusConfig[status] || { class: 'badge-default', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      'pending': { class: 'payment-pending', icon: '⏳', text: 'Pending Review' },
      'approved': { class: 'payment-approved', icon: '✓', text: 'Approved' },
      'rejected': { class: 'payment-rejected', icon: '✕', text: 'Rejected' },
      'cash_on_delivery': { class: 'payment-cash', icon: '💵', text: 'Cash on Delivery' }
    };

    const config = statusConfig[paymentStatus] || { class: 'payment-default', icon: '', text: paymentStatus };
    return (
      <span className={`payment-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'PAYMENT_REVIEW';
    if (filter === 'placed') return order.status === 'PLACED';
    if (filter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  return (
    <div className="customer-order-history">
      <h1>My Orders</h1>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Review ({orders.filter(o => o.status === 'PAYMENT_REVIEW').length})
        </button>
        <button
          className={`tab ${filter === 'placed' ? 'active' : ''}`}
          onClick={() => setFilter('placed')}
        >
          Active ({orders.filter(o => o.status === 'PLACED').length})
        </button>
        <button
          className={`tab ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({orders.filter(o => o.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="empty-icon">📦</div>
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="order-status">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="order-body">
                {/* Payment Information */}
                <div className="payment-info">
                  <strong>Payment:</strong>
                  {getPaymentStatusBadge(order.paymentStatus)}
                  {order.paymentMethod === 'bank' && order.paymentReceipt && (
                    <p className="receipt-info">
                      📎 Receipt: {order.paymentReceipt}
                    </p>
                  )}
                </div>

                {/* Delivery Information */}
                <div className="delivery-info">
                  <strong>Delivery Address:</strong>
                  <p>{order.deliveryAddress}</p>
                  {order.deliveryEmployeeName && (
                    <p className="delivery-employee">
                      Delivery by: {order.deliveryEmployeeName}
                    </p>
                  )}
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="items-summary">
                    <strong>Items ({order.items.length}):</strong>
                    <ul>
                      {order.items.slice(0, 3).map((item, idx) => (
                        <li key={idx}>
                          Product ID: {item.productId} × {item.quantity} - Rs. {(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="more-items">+ {order.items.length - 3} more items</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Rejection Reason (if applicable) */}
                {order.paymentStatus === 'rejected' && order.details && (
                  <div className="rejection-notice">
                    <strong>⚠️ Rejection Reason:</strong>
                    <p>{order.details}</p>
                  </div>
                )}

                {/* Order Total */}
                <div className="order-total">
                  <strong>Total:</strong>
                  <span className="total-amount">Rs. {order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Messages */}
              {order.status === 'PAYMENT_REVIEW' && (
                <div className="order-message info">
                  ℹ️ Your payment is being reviewed. You'll be notified once approved.
                </div>
              )}

              {order.status === 'PLACED' && (
                <div className="order-message success">
                  ✓ Your order is confirmed and will be delivered soon!
                </div>
              )}

              {order.status === 'CANCELLED' && (
                <div className="order-message danger">
                  ✕ This order has been cancelled.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrderHistory;
