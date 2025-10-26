import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config/api';
import './PaymentHandlerDashboard.css';

/**
 * Payment Handler Dashboard Component
 * For employees with "Payment Handler" role to review and approve/reject bank payments
 */
const PaymentHandlerDashboard = ({ employee, onSignOut }) => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState(null);
  
  const employeeId = employee?.id;

  useEffect(() => {
    fetchPendingPayments();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/pending`, {
        headers: {
          'user-id': employeeId.toString()
        }
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPendingPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    if (!window.confirm('Approve this payment? The order will be processed for delivery.')) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/approve/${orderId}`, {
        method: 'POST',
        headers: {
          'user-id': employeeId.toString(),
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      alert(`Payment approved! Assigned to: ${result.deliveryEmployee}`);
      setSelectedOrder(null);
      fetchPendingPayments(); // Refresh list
    } catch (error) {
      alert('Failed to approve payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (orderId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!window.confirm('Reject this payment? The order will be cancelled.')) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/reject/${orderId}`, {
        method: 'POST',
        headers: {
          'user-id': employeeId.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      alert('Payment rejected. Customer has been notified.');
      setSelectedOrder(null);
      setRejectionReason('');
      fetchPendingPayments(); // Refresh list
    } catch (error) {
      alert('Failed to reject payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setRejectionReason('');
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setRejectionReason('');
  };

  if (loading) {
    return <div className="loading">Loading pending payments...</div>;
  }

  return (
    <div className="payment-handler-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>💰 Payment Review Dashboard</h1>
          <p style={{margin: '5px 0 0 0', color: '#666'}}>Welcome, {employee?.name}!</p>
        </div>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <button className="btn-refresh" onClick={fetchPendingPayments}>
            🔄 Refresh
          </button>
          <button 
            className="btn-signout" 
            onClick={onSignOut}
            style={{
              padding: '10px 20px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#c0392b'}
            onMouseOut={(e) => e.target.style.background = '#e74c3c'}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="no-pending">
          <div className="empty-icon">✓</div>
          <h2>No Pending Payments</h2>
          <p>All payments have been reviewed</p>
        </div>
      ) : (
        <div className="pending-payments-list">
          <div className="list-header">
            <span className="badge">{pendingPayments.length}</span>
            Orders awaiting payment review
          </div>

          {pendingPayments.map((order) => (
            <div key={order.id} className="payment-card">
              <div className="card-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="order-amount">
                  Rs. {order.total.toFixed(2)}
                </div>
              </div>

              <div className="card-body">
                <div className="customer-info">
                  <strong>Customer:</strong>
                  <p>{order.customerName || 'N/A'}</p>
                  <p className="text-muted">{order.customerEmail}</p>
                </div>

                <div className="delivery-info">
                  <strong>Delivery Address:</strong>
                  <p>{order.deliveryAddress}</p>
                </div>

                <div className="items-info">
                  <strong>Items:</strong>
                  <ul>
                    {order.items && order.items.map((item, idx) => (
                      <li key={idx}>
                        Product ID: {item.productId} - 
                        Quantity: {item.quantity} - 
                        Price: Rs. {item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="receipt-info">
                  <strong>Payment Receipt:</strong>
                  {order.paymentReceipt ? (
                    <div style={{marginTop: '10px'}}>
                      <img 
                        src={order.paymentReceipt.startsWith('data:') ? order.paymentReceipt : `data:image/jpeg;base64,${order.paymentReceipt}`}
                        alt="Payment Receipt" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '2px solid #ddd',
                          cursor: 'pointer',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const imgSrc = order.paymentReceipt.startsWith('data:') ? order.paymentReceipt : `data:image/jpeg;base64,${order.paymentReceipt}`;
                          setFullSizeImage(imgSrc);
                        }}
                        title="Click to view full size"
                      />
                      <p className="receipt-filename" style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                        Click image to view full size
                      </p>
                    </div>
                  ) : (
                    <p className="receipt-filename">No receipt uploaded</p>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-view"
                  onClick={() => openOrderDetails(order)}
                >
                  View Details
                </button>
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(order.id)}
                  disabled={processing}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => {
                    openOrderDetails(order);
                    document.getElementById('rejection-reason')?.focus();
                  }}
                  disabled={processing}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.id} Details</h2>
              <button className="close-btn" onClick={closeOrderDetails}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productId}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {item.price.toFixed(2)}</td>
                        <td>Rs. {(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3"><strong>Total</strong></td>
                      <td><strong>Rs. {selectedOrder.total.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="detail-section">
                <h3>Payment Receipt</h3>
                <div className="receipt-preview">
                  {selectedOrder.paymentReceipt ? (
                    <div>
                      <img 
                        src={selectedOrder.paymentReceipt.startsWith('data:') ? selectedOrder.paymentReceipt : `data:image/jpeg;base64,${selectedOrder.paymentReceipt}`}
                        alt="Payment Receipt" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '500px',
                          borderRadius: '8px',
                          border: '2px solid #ddd',
                          cursor: 'pointer',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto',
                          backgroundColor: '#f5f5f5'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const imgSrc = selectedOrder.paymentReceipt.startsWith('data:') ? selectedOrder.paymentReceipt : `data:image/jpeg;base64,${selectedOrder.paymentReceipt}`;
                          setFullSizeImage(imgSrc);
                        }}
                        title="Click to view full size"
                      />
                      <p style={{textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '10px'}}>
                        Click image to view full size
                      </p>
                    </div>
                  ) : (
                    <p className="receipt-filename">No receipt uploaded</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Review Actions</h3>
                <div className="review-actions">
                  <button
                    className="btn-approve-large"
                    onClick={() => handleApprove(selectedOrder.id)}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : '✓ Approve Payment'}
                  </button>

                  <div className="rejection-section">
                    <label htmlFor="rejection-reason">Rejection Reason:</label>
                    <textarea
                      id="rejection-reason"
                      className="rejection-input"
                      placeholder="Enter reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="3"
                    />
                    <button
                      className="btn-reject-large"
                      onClick={() => handleReject(selectedOrder.id)}
                      disabled={processing || !rejectionReason.trim()}
                    >
                      {processing ? 'Processing...' : '✕ Reject Payment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Image Modal */}
      {fullSizeImage && (
        <div 
          className="modal-overlay"
          onClick={() => setFullSizeImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullSizeImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 2001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              ×
            </button>
            <img 
              src={fullSizeImage}
              alt="Full Size Receipt"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHandlerDashboard;
