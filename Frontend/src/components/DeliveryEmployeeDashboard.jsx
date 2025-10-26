import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeliveryEmployeeDashboard.css';

const DeliveryEmployeeDashboard = ({ employee, onSignOut }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState({});
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const employeeId = employee?.id || localStorage.getItem('employeeId');
  const employeeName = employee?.name || localStorage.getItem('employeeName');

  useEffect(() => {
    if (employeeId) {
      fetchMyOrders();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchMyOrders, 30000);
      return () => clearInterval(interval);
    } else {
      setError('Employee ID not found. Please log in again.');
      setLoading(false);
    }
  }, [employeeId]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching orders for delivery employee ID: ${employeeId}`);
      
      const response = await axios.get(
        `http://localhost:8081/api/employees/${employeeId}/orders`
      );
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setOrders(response.data.orders || []);
        setEmployeeInfo({
          name: response.data.employeeName || employeeName,
          totalOrders: response.data.totalOrders
        });
        console.log(`✅ ${response.data.totalOrders} orders loaded for ${response.data.employeeName}`);
      }
    } catch (err) {
      setError('Failed to fetch orders: ' + (err.response?.data?.error || err.message));
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PLACED': return '#3498db';
      case 'DELIVERED': return '#2ecc71';
      case 'CANCELLED': return '#e74c3c';
      case 'REVIEW': return '#f39c12';
      case 'PENDING': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PLACED': return '📦';
      case 'DELIVERED': return '✅';
      case 'CANCELLED': return '❌';
      case 'REVIEW': return '⏳';
      default: return '📋';
    }
  };

  const filterOrdersByStatus = (status) => {
    if (status === 'ALL') return orders;
    return orders.filter(order => order.status?.toUpperCase() === status.toUpperCase());
  };

  const getFilteredOrders = () => {
    return filterOrdersByStatus(filterStatus);
  };

  const countOrdersByStatus = (status) => {
    return orders.filter(order => order.status?.toUpperCase() === status.toUpperCase()).length;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2);
  };

  const markAsDelivered = async (orderId) => {
    if (!window.confirm('Mark this order as delivered?')) return;
    
    try {
      const response = await axios.put(
        `http://localhost:8081/api/orders/${orderId}/mark-delivered`,
        { employeeId: parseInt(employeeId) },
        {
          headers: {
            'Content-Type': 'application/json',
            'user-id': employeeId
          }
        }
      );
      
      if (response.data.success || response.status === 200) {
        alert('✅ Order marked as delivered successfully!');
        fetchMyOrders();
      }
    } catch (error) {
      console.error('❌ Failed to mark as delivered:', error);
      alert('Failed to mark as delivered: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your assigned orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={fetchMyOrders} className="retry-btn">🔄 Try Again</button>
        <button onClick={onSignOut} className="login-btn">
          🔐 Back to Login
        </button>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="delivery-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚚 Delivery Dashboard</h1>
          <div className="employee-info">
            <p className="employee-name">👤 {employeeInfo.name}</p>
            <p className="employee-stats">
              📦 {employeeInfo.totalOrders} Total Orders | 
              💰 Rs. {calculateTotalRevenue()} Total Value
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="refresh-btn" onClick={fetchMyOrders}>
            🔄 Refresh
          </button>
          {onSignOut && (
            <button className="signout-btn" onClick={onSignOut}>
              🚪 Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Summary Cards */}
      <div className="orders-summary">
        <div className="summary-card all" onClick={() => setFilterStatus('ALL')}>
          <h3>📋 All Orders</h3>
          <p className="count">{orders.length}</p>
        </div>
        <div className="summary-card pending" onClick={() => setFilterStatus('PLACED')}>
          <h3>📦 Pending</h3>
          <p className="count">{countOrdersByStatus('PLACED')}</p>
        </div>
        <div className="summary-card delivered" onClick={() => setFilterStatus('DELIVERED')}>
          <h3>✅ Delivered</h3>
          <p className="count">{countOrdersByStatus('DELIVERED')}</p>
        </div>
        <div className="summary-card cancelled" onClick={() => setFilterStatus('CANCELLED')}>
          <h3>❌ Cancelled</h3>
          <p className="count">{countOrdersByStatus('CANCELLED')}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filterStatus === 'ALL' ? 'active' : ''} 
          onClick={() => setFilterStatus('ALL')}
        >
          All ({orders.length})
        </button>
        <button 
          className={filterStatus === 'PLACED' ? 'active' : ''} 
          onClick={() => setFilterStatus('PLACED')}
        >
          Pending ({countOrdersByStatus('PLACED')})
        </button>
        <button 
          className={filterStatus === 'DELIVERED' ? 'active' : ''} 
          onClick={() => setFilterStatus('DELIVERED')}
        >
          Delivered ({countOrdersByStatus('DELIVERED')})
        </button>
        <button 
          className={filterStatus === 'CANCELLED' ? 'active' : ''} 
          onClick={() => setFilterStatus('CANCELLED')}
        >
          Cancelled ({countOrdersByStatus('CANCELLED')})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <h3>📭 No {filterStatus !== 'ALL' ? filterStatus : ''} Orders</h3>
          <p>
            {orders.length === 0 
              ? "You don't have any orders assigned yet. Check back later!"
              : `No ${filterStatus} orders found. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              {/* Order Header */}
              <div className="order-header">
                <div className="order-title">
                  <h3>Order #{order.id}</h3>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)} {order.status?.toUpperCase()}
                </span>
              </div>

              {/* Order Body */}
              <div className="order-body">
                {/* Customer Information */}
                <div className="section customer-section">
                  <h4>👤 Customer Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Name:</span>
                      <span className="value">{order.customerName || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">
                        {order.customerPhone ? (
                          <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
                        ) : 'N/A'}
                      </span>
                    </div>
                    <div className="info-item full-width">
                      <span className="label">📍 Delivery Address:</span>
                      <span className="value address">{order.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="section payment-section">
                  <h4>💰 Payment Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Method:</span>
                      <span className="value">
                        {order.paymentMethod === 'cash' ? '💵 Cash on Delivery' : '🏦 Bank Transfer'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className={`payment-status ${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Total Amount:</span>
                      <span className="value total-amount">Rs. {order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="section items-section">
                  <h4>📦 Order Items ({order.items?.length || 0})</h4>
                  <div className="items-table-container">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td className="product-name">{item.productName}</td>
                            <td className="quantity">×{item.quantity}</td>
                            <td>Rs. {item.price?.toFixed(2)}</td>
                            <td className="subtotal">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="total-label">Total:</td>
                          <td className="total-value">Rs. {order.total?.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              {order.status?.toUpperCase() === 'PLACED' && (
                <div className="order-actions">
                  <button 
                    className="btn-primary" 
                    onClick={() => markAsDelivered(order.id)}
                  >
                    ✅ Mark as Delivered
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
                  >
                    🗺️ View on Map
                  </button>
                  {order.customerPhone && (
                    <button 
                      className="btn-info" 
                      onClick={() => window.open(`tel:${order.customerPhone}`)}
                    >
                      📞 Call Customer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryEmployeeDashboard;
