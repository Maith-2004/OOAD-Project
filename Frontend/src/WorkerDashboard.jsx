import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WorkerDashboard.css';

const WorkerDashboard = ({ employee, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('bakery');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const userId = employee?.id;
  const userName = employee?.name;

  const categories = [
    { id: 'bakery', name: 'Bakery', icon: '🥖', endpoint: '/api/bakery' },
    { id: 'fruits', name: 'Fruits', icon: '🍎', endpoint: '/api/fruits' },
    { id: 'dairy', name: 'Dairy', icon: '🥛', endpoint: '/api/dairy' },
    { id: 'meat', name: 'Meat', icon: '🥩', endpoint: '/api/meat' },
    { id: 'beverages', name: 'Beverages', icon: '🥤', endpoint: '/api/beverages' },
    { id: 'grains', name: 'Grains', icon: '🌾', endpoint: '/api/grains' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥕', endpoint: '/api/vegetables' },
    { id: 'products', name: 'Other Products', icon: '🛒', endpoint: '/api/products' }
  ];

  const currentCategory = categories.find(cat => cat.id === activeTab);

  // Fetch products for current category
  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8081${currentCategory.endpoint}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({
          ...prev,
          image: base64String
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setImagePreview(null);
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.quantity) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        image: formData.image || null
      };

      await axios.post(
        `http://localhost:8081${currentCategory.endpoint}`,
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId
          }
        }
      );

      alert('✅ Product added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', description: '', price: '', quantity: '', image: '' });
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.error || 'Failed to add product');
    }
  };

  // Edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();

    try {
      // Merge all fields from selectedProduct with form changes
      const updatedProduct = {
        ...selectedProduct,
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        image: formData.image || selectedProduct.image || null
      };

      // Send complete product data
      const response = await axios.put(
        `http://localhost:8081${currentCategory.endpoint}/${selectedProduct.id}`,
        updatedProduct,
        {
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId
          }
        }
      );

      alert('✅ Product updated successfully!');
      setShowEditModal(false);
      setSelectedProduct(null);
      setFormData({ name: '', description: '', price: '', quantity: '', image: '' });
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      console.error('❌ Error updating product:', error);
      if (error.response) {
        console.error('Backend response:', error.response.data);
        alert(error.response.data?.error || error.response.data?.message || 'Failed to update product');
      } else {
        alert('Failed to update product');
      }
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8081${currentCategory.endpoint}/${productId}`,
        {
          headers: {
            'user-id': userId
          }
        }
      );

      alert('✅ Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  // Open edit modal with product data
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      image: product.image || ''
    });
    setImagePreview(product.image || null);
    setShowEditModal(true);
  };

  return (
    <div className="worker-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>👷 Worker Dashboard</h1>
          <p>Welcome, {userName}!</p>
        </div>
        <button className="logout-btn" onClick={onSignOut}>
          Logout
        </button>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeTab === category.id ? 'active' : ''}`}
            onClick={() => setActiveTab(category.id)}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <h2>{currentCategory.icon} {currentCategory.name} Products</h2>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Add New Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products">
              <p>No products found in this category</p>
              <button onClick={() => setShowAddModal(true)}>Add First Product</button>
            </div>
          ) : (
            products.map(product => (
              <div key={`${activeTab}-${product.id}`} className="product-card">
                {product.image && (
                  <div className="product-image-display">
                    <img src={product.image} alt={product.name} />
                  </div>
                )}
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <span className={`stock-badge ${product.quantity < 10 ? 'low' : ''}`}>
                    Stock: {product.quantity}
                  </span>
                </div>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">Rs. {product.price}</span>
                  <div className="product-actions">
                    <button 
                      className="edit-btn-small"
                      onClick={() => openEditModal(product)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="delete-btn-small"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New {currentCategory.name} Product</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                      >
                        × Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-box">
                      <input
                        type="file"
                        id="add-image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="add-image-upload" className="upload-label">
                        <div className="upload-icon">📷</div>
                        <div>Click to upload image</div>
                        <div className="upload-hint">PNG, JPG up to 5MB</div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit {currentCategory.name} Product</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                      >
                        × Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-box">
                      <input
                        type="file"
                        id="edit-image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="edit-image-upload" className="upload-label">
                        <div className="upload-icon">📷</div>
                        <div>Click to upload image</div>
                        <div className="upload-hint">PNG, JPG up to 5MB</div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
