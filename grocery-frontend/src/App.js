import React, {useState, useEffect} from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';
import HomePage from './HomePage';
import DeliveryEmployeeDashboard from './components/DeliveryEmployeeDashboard';
import WorkerDashboard from './WorkerDashboard';
import PaymentHandlerDashboard from './PaymentHandlerDashboard';
import './styles/categories.css';

// Use relative URL for production (same origin), localhost for development
const API = process.env.NODE_ENV === 'production' 
  ? '/api'  // Production: same domain
  : 'http://localhost:8081/api';  // Development: local backend

// Employee roles configuration
const EMPLOYEE_ROLES = {
  DELIVERY: 'Delivery',
  WORKER: 'Worker', 
  PAYMENT_HANDLER: 'Payment Handler'
};

const ROLE_CONFIG = {
  [EMPLOYEE_ROLES.DELIVERY]: {
    displayName: 'Delivery Staff',
    icon: '🚚',
    color: '#28a745',
    description: 'Handle order deliveries to customers',
    permissions: {
      canViewOrders: true,
      canManageInventory: false,
      canProcessPayments: false,
      canManageDeliveries: true,
      canViewReports: false
    }
  },
  [EMPLOYEE_ROLES.WORKER]: {
    displayName: 'Store Worker', 
    icon: '👷',
    color: '#007bff',
    description: 'General store operations and inventory management',
    permissions: {
      canViewOrders: true,
      canManageInventory: true,
      canProcessPayments: false,
      canManageDeliveries: false,
      canViewReports: true
    }
  },
  [EMPLOYEE_ROLES.PAYMENT_HANDLER]: {
    displayName: 'Payment Handler',
    icon: '💰', 
    color: '#ffc107',
    description: 'Process payments and financial transactions',
    permissions: {
      canViewOrders: true,
      canManageInventory: false,
      canProcessPayments: true,
      canManageDeliveries: false,
      canViewReports: true
    }
  }
};

function App(){
  const [search, setSearch] = useState("");
  function signOut() {
    setUser({ guest: true });
    setEmployee(null);
    setCart([]);
    setPage('home');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('employeeData');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('employeeName');
    localStorage.removeItem('employeeRole');
    showPopupMsg('Signed out successfully');
  }
  
  // Image handling functions
  function handleImageFile(file) {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showPopupMsg('Please upload an image file (JPG, PNG, GIF, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showPopupMsg('Image size must be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm({...form, image: reader.result}); // Store base64 in form
    };
    reader.readAsDataURL(file);
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }
  
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }
  
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  }
  
  function handleFileSelect(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  }
  
  function clearImage() {
    setImageFile(null);
    setImagePreview('');
    // Don't update form here, let the caller handle it
  }
  
  function resetForm() {
    setForm({});
    setImageFile(null);
    setImagePreview('');
    setEditingProductId(null);
  }
  
  function managerCreateProduct() {
    if (!user || user.role !== 'manager') {
      showPopupMsg('Only managers can create products.');
      return;
    }
    if (!form.name || !form.description || !form.price || !form.quantity || !form.category) {
      showPopupMsg('Please fill in all product fields including category.');
      return;
    }
    axios.post(`${API}/${form.category}`, {
      name: form.name,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
      image: form.image || null  // Include image URL
    }, {
      headers: { 'user-id': user.id }
    })
    .then(()=>{ 
      showPopupMsg('Product created'); 
      resetForm();
      fetchAllProducts(); 
    })
    .catch(e=>{
      let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Create product failed';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      showPopupMsg(msg);
    });
  }

  function managerUpdateProduct(id) {
    if (!user || user.role !== 'manager') {
      showPopupMsg('Only managers can edit products.');
      return;
    }
    if (!form.name || !form.description || !form.price || !form.quantity) {
      showPopupMsg('Please fill in all product fields.');
      return;
    }
    axios.put(`${API}/products/${id}`, {
      name: form.name,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
      image: form.image || null  // Include image URL
    }, {
      headers: { 'user-id': user.id }
    })
    .then(()=>{ 
      showPopupMsg('Product updated'); 
      resetForm();
      fetchAllProducts(); 
    })
    .catch(e=>{
      let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Edit product failed';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      showPopupMsg(msg);
    });
  }

  function managerDeleteProduct(id) {
    if (!user || user.role !== 'manager') {
      showPopupMsg('Only managers can delete products.');
      return;
    }
    // Ensure id is a valid number or string, not something like '1:1'
    if (!id || typeof id !== 'number' && !/^[0-9]+$/.test(id)) {
      showPopupMsg('Invalid product ID.');
      return;
    }
    axios.delete(`${API}/products/${id}`, {
      headers: { 'user-id': user.id }
    })
    .then(()=>{ showPopupMsg('Product deleted'); fetchAllProducts(); })
    .catch(e=>{
      let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Delete product failed';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      showPopupMsg(msg);
    });
  }
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const [showCustomAddressInput, setShowCustomAddressInput] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'bank'
  const [paymentReceipt, setPaymentReceipt] = useState(null); // For bank payment receipt
  const [receiptPreview, setReceiptPreview] = useState(''); // For preview
  
  function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showPopupMsg('Please upload a valid image file (JPG, PNG, GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showPopupMsg('File size must be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result);
      setPaymentReceipt(reader.result); // Store as base64
    };
    reader.readAsDataURL(file);
  }
  
  function placeOrder() {
    if (!user) return showPopupMsg('login first');
    
    // Validate bank payment has receipt
    if (paymentMethod === 'bank' && !paymentReceipt) {
      showPopupMsg('Please upload your payment receipt for bank payment');
      return;
    }
    
    setShowAddressPrompt(true);
    setShowCustomAddressInput(false);
  }

  function handleAddressChoice(useSaved) {
    if (useSaved) {
      if (user && typeof user.address === 'string' && user.address.trim()) {
        submitOrder(user.address.trim(), "yes");
      } else {
        showPopupMsg('No saved address found. Please enter a delivery address.');
        setShowCustomAddressInput(true);
        setShowAddressPrompt(false);
      }
    } else {
      setShowCustomAddressInput(true);
      setShowAddressPrompt(false);
    }
  }

  function getAvailableDeliveryEmployee() {
    // Safety check: ensure employees is an array
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      console.log('No employees available (not an array or empty):', employees);
      return null;
    }
    
    // Debug: Check what employees we have
    console.log('All employees:', employees);
    console.log('Employees length:', employees.length);
    
    // Get all employees with "delivery" role
    const deliveryEmployees = employees.filter(emp => emp.role && emp.role.toLowerCase() === 'delivery');
    
    if (deliveryEmployees.length === 0) {
      console.log('No delivery employees found');
      return null;
    }
    
    // For now, assign randomly. In a real app, you might check availability, workload, etc.
    const randomIndex = Math.floor(Math.random() * deliveryEmployees.length);
    return deliveryEmployees[randomIndex];
  }

  // Approve payment - changes order status from 'review' to 'placed'
  function approvePayment(orderId) {
    if (!employee || employee.role !== 'Payment Handler') {
      showPopupMsg('❌ Only Payment Handlers can approve payments');
      return;
    }

    if (window.confirm(`Approve payment for Order #${orderId}?\n\nThis will change the order status to "placed" and notify the customer.`)) {
      axios.put(`${API}/orders/${orderId}/approve-payment`, {
        approvedBy: employee.id,
        approvedByName: employee.name
      })
        .then((response) => {
          showPopupMsg(`✅ Payment approved! Order #${orderId} is now placed and will be processed for delivery.`);
          // Refresh orders to show updated status
          fetchOrders();
        })
        .catch((error) => {
          console.error('Approve payment error:', error);
          showPopupMsg(`❌ Failed to approve payment: ${error.response?.data?.message || error.message}`);
        });
    }
  }

  // Reject payment - changes order status to 'rejected'
  function rejectPayment(orderId) {
    if (!employee || employee.role !== 'Payment Handler') {
      showPopupMsg('❌ Only Payment Handlers can reject payments');
      return;
    }

    const reason = window.prompt(`Reject payment for Order #${orderId}?\n\nPlease provide a reason for rejection (customer will be notified):`);
    
    if (reason !== null && reason.trim() !== '') {
      axios.put(`${API}/orders/${orderId}/reject-payment`, {
        rejectedBy: employee.id,
        rejectedByName: employee.name,
        rejectionReason: reason.trim()
      })
        .then((response) => {
          showPopupMsg(`❌ Payment rejected for Order #${orderId}. Customer will be notified.`);
          // Refresh orders to show updated status
          fetchOrders();
        })
        .catch((error) => {
          console.error('Reject payment error:', error);
          showPopupMsg(`❌ Failed to reject payment: ${error.response?.data?.message || error.message}`);
        });
    } else if (reason !== null) {
      showPopupMsg('⚠️ Rejection cancelled - reason is required');
    }
  }

  function submitOrder(deliveryAddress, useSavedAddress) {
    if (!user) return showPopupMsg('login first');
    if (cart.length === 0) return showPopupMsg('Cart is empty.');
    
    console.log('Attempting to submit order, employees state:', employees);
    
    // Include category field for stock management (backend requirement)
    const items = (Array.isArray(cart) ? cart : []).map(p => ({
      productId: p.id,
      quantity: p.cartQty || 1,
      price: p.price,
      category: (p.category || determineProductCategory(p)).toLowerCase() // Required for stock validation, lowercase for backend
    }));
    
    console.log('📦 Order items with categories:', items);
    
    // Determine delivery address
    let finalDeliveryAddress;
    if (useSavedAddress === "no") {
      if (!deliveryAddress || !deliveryAddress.trim()) return showPopupMsg('Please enter a delivery address.');
      finalDeliveryAddress = deliveryAddress.trim();
    } else if (useSavedAddress === "yes") {
      const savedAddress = user.address || user.deliveryAddress || user.delivery_address || '';
      if (!savedAddress) {
        console.warn('⚠️ User has no saved address:', user);
        return showPopupMsg('No saved address found. Please enter a delivery address.');
      }
      finalDeliveryAddress = savedAddress;
      console.log('📍 Using saved address:', savedAddress);
    }
    
    // Calculate total
    const calculateTotal = () => {
      return cart.reduce((total, item) => total + (item.price * (item.cartQty || 1)), 0);
    };
    
    // Create JSON payload matching backend OrderController requirements
    const payload = {
      customerId: user.id,
      items: items,
      paymentMethod: paymentMethod
    };
    
    // Always include delivery_address explicitly (backend might not handle useSavedAddress)
    payload.delivery_address = finalDeliveryAddress;
    
    // Only include paymentReceipt for bank payments (backend requirement)
    if (paymentMethod === 'bank' && paymentReceipt) {
      payload.paymentReceipt = paymentReceipt;
    }
    
    // DON'T include: status, assignedDeliveryEmployeeId, assignedDeliveryEmployeeName, useSavedAddress
    // Backend sets these automatically
    
    console.log('📤 Submitting order with JSON payload:', JSON.stringify(payload, null, 2));
    console.log('💳 Payment method:', paymentMethod);
    console.log('📄 Has receipt:', !!paymentReceipt);
    console.log('🏠 Delivery address:', finalDeliveryAddress);
    console.log('👤 Customer ID:', user.id);
    console.log('🛒 Items count:', items.length);
    console.log('💰 Total amount:', calculateTotal());
    
    // Use /api/orders endpoint with JSON format
    axios.post(API+'/orders', payload)
      .then((response)=>{
        const result = response.data;
        console.log('✅ Order submission successful! Backend response:', result);
        
        // Check if backend returned an error in the response
        if (result.error) {
          console.error('❌ Backend returned error:', result.error);
          console.error('📊 Stock errors details:', result.stockErrors);
          
          // Handle stock errors specifically
          if (result.error === 'Insufficient stock for some items' && result.stockErrors) {
            const stockErrorsList = (Array.isArray(result.stockErrors) ? result.stockErrors : []).map(err => {
              console.log('Stock error item:', err);
              return `${err.productName || `Product ${err.productId}`}: Requested ${err.requestedQuantity}, Available ${err.availableStock}`;
            }).join('\n');
            showPopupMsg(`❌ Insufficient Stock:\n\n${stockErrorsList}\n\nPlease reduce quantities and try again.`);
          } else {
            showPopupMsg(`❌ Order failed: ${result.error}`);
          }
          return;
        }
        
        // Different messages based on payment method
        if (paymentMethod === 'bank') {
          // Bank payment order goes to "review" status
          showPopupMsg(`📋 Order #${result.orderId || result.id || 'submitted'} received!
💳 Your payment receipt has been uploaded and is pending review.
⏳ Status: Under Review
📧 You will be notified once the payment is verified by our payment handler.
💰 Total: Rs. ${result.total ? result.total.toFixed(2) : cart.reduce((s,p)=>s+p.price*(p.cartQty||1),0).toFixed(2)}`);
        } else {
          // Cash on delivery order is placed immediately
          if (result.deliveryEmployee) {
            showPopupMsg(`🎉 Order #${result.orderId || result.id || 'placed'} placed successfully!
💵 Payment Method: Cash on Delivery
💰 Total: Rs. ${result.total ? result.total.toFixed(2) : cart.reduce((s,p)=>s+p.price*(p.cartQty||1),0).toFixed(2)}
🚚 Assigned Delivery Employee: ${result.deliveryEmployee}`);
          } else if (result.assignedDeliveryEmployeeName) {
            showPopupMsg(`🎉 Order #${result.orderId || result.id || 'placed'} placed successfully!
💵 Payment Method: Cash on Delivery
💰 Total: Rs. ${cart.reduce((s,p)=>s+p.price*(p.cartQty||1),0).toFixed(2)}
🚚 Assigned to: ${result.assignedDeliveryEmployeeName}`);
          } else {
            showPopupMsg(`✅ Order #${result.orderId || result.id || 'placed'} placed successfully!
💵 Payment Method: Cash on Delivery
💰 Total: Rs. ${cart.reduce((s,p)=>s+p.price*(p.cartQty||1),0).toFixed(2)}
🚚 Delivery employee will be assigned shortly.`);
          }
        }
        
        // Clear cart and reset all states
        setCart([]);
        setOrderNotes('');
        setPaymentReceipt(null);
        setReceiptPreview('');
        setPaymentMethod('cash');
        
        // Refresh orders to show new order
        if (user && !user.guest) {
          fetchUserOrders();
        }
      })
      .catch((error)=>{
        console.error('❌ Order submission error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Payload sent:', payload);
        
        // Handle stock-related errors specifically
        const errorData = error.response?.data;
        
        if (errorData?.error === 'Insufficient stock' && errorData?.stockErrors) {
          // Format stock error messages
          const stockErrorsList = (Array.isArray(errorData.stockErrors) ? errorData.stockErrors : []).map(err => 
            `• ${err.productName || 'Unknown Product'}: Requested ${err.requestedQuantity}, Available ${err.availableStock}`
          ).join('\n');
          
          showPopupMsg(`❌ Insufficient Stock!\n\nThe following items don't have enough stock:\n${stockErrorsList}\n\nPlease reduce quantities or remove items.`);
        } else {
          // General error handling
          const errorMsg = errorData?.error || 
                          errorData?.message || 
                          errorData || 
                          error.message || 
                          'Order failed. Please try again.';
          
          showPopupMsg(`❌ ${typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}`);
        }
      });
    setShowAddressPrompt(false);
    setShowCustomAddressInput(false);
    setCustomAddress('');
  }
  const [page,setPage] = useState('home');
  const [products,setProducts] = useState([]);
  const [bakery, setBakery] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [dairy, setDairy] = useState([]);
  const [meat, setMeat] = useState([]);
  const [beverages, setBeverages] = useState([]);
  const [grains, setGrains] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart,setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [user,setUser] = useState(null);
  const [form,setForm] = useState({username:'',email:'',password:'',address:'',phone:''});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [qtys, setQtys] = useState({});
  
  // New Category API states
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [categoryStats, setCategoryStats] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(()=>{ 
    // Load products for any user (logged in, guest, or employee)
    if(user) fetchAllProducts(); 
  },[user]);
  
  // Also load products when component mounts, even without a user
  useEffect(()=>{ 
    fetchAllProducts();
    // Load categories from Category API
    loadCategories();
  },[]);
  
  async function loadCategories() {
    const cats = await fetchCategories();
    if (cats && cats.length > 0) {
      setCategories(cats);
    }
  }
  
  // Debug category changes
  useEffect(() => {
    console.log('Category changed in useEffect:', selectedCategory);
  }, [selectedCategory]);
  useEffect(() => {
    // Don't force guests to homepage if they navigate to products
    if (user && user.guest && page !== 'home' && page !== 'products') {
      setPage('home');
    }
  }, [user, page]);
  
  // Fetch employees when user loads (needed for delivery assignment)
  useEffect(() => {
    console.log('🔍 Employee fetch check:', { 
      user: user?.role, 
      employee: employee?.role, 
      shouldFetch: user && !user.guest && (user.role === 'manager' || employee?.role === 'Payment Handler')
    });
    
    if (user && !user.guest && (user.role === 'manager' || employee?.role === 'Payment Handler')) {
      console.log('✅ Authorized to fetch employees');
      fetchEmployees();
    } else {
      console.log('❌ Not authorized to fetch employees, ensuring empty array');
      setEmployees([]); // Ensure employees is always an empty array for non-authorized users
    }
  }, [user, employee]);
  
  // Clear receipt when switching from bank to cash payment
  useEffect(() => {
    if (paymentMethod === 'cash') {
      setPaymentReceipt(null);
      setReceiptPreview('');
    }
  }, [paymentMethod]);

  // Load favourites from backend when user changes
  useEffect(() => {
    if (user && !user.guest) {
      fetchUserFavourites();
    } else {
      setFavourites([]); // Clear favourites for guests
    }
  }, [user]);

  // Fetch user orders when orders page is opened
  useEffect(() => {
    if (page === 'orders' && user && !user.guest) {
      fetchUserOrders();
    }
  }, [page, user]);

  // Load employee data on app startup
  useEffect(() => {
    const employeeData = localStorage.getItem('employeeData');
    const userType = localStorage.getItem('userType');
    
    if (employeeData && userType === 'employee') {
      try {
        const parsedEmployee = JSON.parse(employeeData);
        setEmployee(parsedEmployee);
        setUser(parsedEmployee);
      } catch (e) {
        localStorage.removeItem('employeeData');
        localStorage.removeItem('userType');
      }
    }
  }, []);

  // No longer needed - favourites are stored in backend
  // useEffect(() => {
  //   if (user && !user.guest && favourites.length >= 0) {
  //     localStorage.setItem(`favourites_${user.id}`, JSON.stringify(favourites));
  //   }
  // }, [favourites, user]);
  
  async function fetchAllProducts(){
    try {
      // Use new Category API - fetch all products in one call
      console.log('🔄 Fetching all products using Category API...');
      const response = await axios.get(`${API}/categories/all-products`);
      
      if (response.data.success && response.data.products) {
        const allProducts = response.data.products;
        console.log(`✅ Loaded ${allProducts.length} products from Category API`);
        console.log('🔍 Sample products:', allProducts.slice(0, 3).map(p => ({ name: p.name, category: p.category })));
        console.log('🔍 ALL product names:', allProducts.map(p => p.name));
        
        // Sort products into categories
        const categorizedProducts = {
          products: [],
          bakery: [],
          fruits: [],
          dairy: [],
          meat: [],
          beverages: [],
          grains: [],
          vegetables: []
        };
        
        allProducts.forEach(product => {
          let category = 'products';
          
          if (product.category) {
            const cat = product.category.toLowerCase();
            if (categorizedProducts[cat]) {
              category = cat;
            }
          } else {
            // Fallback: detect category from product name/description if category field is missing
            const combined = `${product.name || ''} ${product.description || ''}`.toLowerCase();
            if (combined.includes('bread') || combined.includes('croissant') || combined.includes('baguette') || combined.includes('muffin')) {
              category = 'bakery';
            } else if (combined.includes('apple') || combined.includes('banana') || combined.includes('orange') || combined.includes('strawberry') || combined.includes('fruit')) {
              category = 'fruits';
            } else if (combined.includes('milk') || combined.includes('cheese') || combined.includes('yogurt') || combined.includes('butter') || combined.includes('dairy')) {
              category = 'dairy';
            } else if (combined.includes('chicken') || combined.includes('beef') || combined.includes('pork') || combined.includes('meat') || combined.includes('fish')) {
              category = 'meat';
            } else if (combined.includes('juice') || combined.includes('soda') || combined.includes('water') || combined.includes('coffee') || combined.includes('tea') || combined.includes('beverage')) {
              category = 'beverages';
            } else if (combined.includes('rice') || combined.includes('wheat') || combined.includes('oats') || combined.includes('grain') || combined.includes('cereal')) {
              category = 'grains';
            } else if (combined.includes('tomato') || combined.includes('carrot') || combined.includes('onion') || combined.includes('lettuce') || combined.includes('pepper') || combined.includes('broccoli') || combined.includes('spinach') || combined.includes('cabbage') || combined.includes('cucumber') || combined.includes('potato') || combined.includes('vegetable')) {
              category = 'vegetables';
            }
          }
          
          categorizedProducts[category].push(product);
        });
        
        // Update state for each category
        setProducts(categorizedProducts.products);
        setBakery(categorizedProducts.bakery);
        setFruits(categorizedProducts.fruits);
        setDairy(categorizedProducts.dairy);
        setMeat(categorizedProducts.meat);
        setBeverages(categorizedProducts.beverages);
        setGrains(categorizedProducts.grains);
        setVegetables(categorizedProducts.vegetables);
        
        console.log('📦 Products sorted by category:', {
          products: categorizedProducts.products.length,
          bakery: categorizedProducts.bakery.length,
          fruits: categorizedProducts.fruits.length,
          dairy: categorizedProducts.dairy.length,
          meat: categorizedProducts.meat.length,
          beverages: categorizedProducts.beverages.length,
          grains: categorizedProducts.grains.length,
          vegetables: categorizedProducts.vegetables.length
        });
        
        // If no vegetables from category API, try direct endpoint immediately
        if (categorizedProducts.vegetables.length === 0) {
          console.log('⚠️ No vegetables from Category API, trying direct vegetables endpoint...');
          try {
            const vegResponse = await axios.get(`${API}/vegetables`);
            if (vegResponse.data && Array.isArray(vegResponse.data) && vegResponse.data.length > 0) {
              console.log(`✅ Loaded ${vegResponse.data.length} vegetables from direct /api/vegetables endpoint`);
              setVegetables(vegResponse.data);
            }
          } catch (vegError) {
            console.log('❌ Direct vegetables endpoint also failed:', vegError.message);
          }
        }
        
        return;
      }
      
      // Fallback: Try individual category endpoints
      console.log('⚠️ Category API failed, trying individual endpoints...');
      const categories = ['products', 'bakery', 'fruits', 'dairy', 'meat', 'beverages', 'grains', 'vegetables'];
      const setters = [setProducts, setBakery, setFruits, setDairy, setMeat, setBeverages, setGrains, setVegetables];
      let hasData = false;
      
      for (let i = 0; i < categories.length; i++) {
        try {
          // Try category API first
          let categoryResponse = await axios.get(`${API}/categories/${categories[i]}`);
          if (categoryResponse.data.success && categoryResponse.data.products) {
            console.log(`✅ ${categories[i]}: ${categoryResponse.data.products.length} items`);
            setters[i](categoryResponse.data.products);
            if (categoryResponse.data.products.length > 0) hasData = true;
          }
        } catch (error) {
          // For vegetables, try direct endpoint as fallback
          if (categories[i] === 'vegetables') {
            try {
              const directResponse = await axios.get(`${API}/vegetables`);
              if (directResponse.data && Array.isArray(directResponse.data)) {
                console.log(`✅ ${categories[i]} (direct): ${directResponse.data.length} items`);
                setters[i](directResponse.data);
                if (directResponse.data.length > 0) hasData = true;
              }
            } catch (directError) {
              console.log(`❌ Failed to fetch ${categories[i]} from direct endpoint:`, directError.message);
              setters[i]([]);
            }
          } else {
            console.log(`❌ Failed to fetch ${categories[i]}:`, error.message);
            setters[i]([]);
          }
        }
      }
      
      if (hasData) {
        console.log('✅ Successfully loaded products from category endpoints');
        return;
      }
      
      // Final fallback: old products endpoint
      const oldResponse = await axios.get(`${API}/products`);
      const allProducts = oldResponse.data;
      console.log('⚠️ Using old products endpoint:', allProducts.length, 'items');
      
      // Sort products into categories
      const categorizedProducts = {
        products: [],
        bakery: [],
        fruits: [],
        dairy: [],
        meat: [],
        beverages: [],
        grains: [],
        vegetables: []
      };
      
      allProducts.forEach(product => {
        let category = 'products';
        
        if (product.category) {
          const cat = product.category.toLowerCase();
          if (categorizedProducts[cat]) {
            category = cat;
          }
        } else {
          // Enhanced categorization logic
          const name = product.name.toLowerCase();
          const desc = (product.description || '').toLowerCase();
          const combined = name + ' ' + desc;
          
          if (combined.includes('bread') || combined.includes('cake') || combined.includes('bakery') || combined.includes('croissant') || combined.includes('muffin') || combined.includes('donut')) {
            category = 'bakery';
          } else if (combined.includes('apple') || combined.includes('banana') || combined.includes('fruit') || combined.includes('orange') || combined.includes('grape') || combined.includes('berry')) {
            category = 'fruits';
          } else if (combined.includes('milk') || combined.includes('cheese') || combined.includes('dairy') || combined.includes('yogurt') || combined.includes('butter') || combined.includes('cream')) {
            category = 'dairy';
          } else if (combined.includes('meat') || combined.includes('chicken') || combined.includes('beef') || combined.includes('pork') || combined.includes('fish') || combined.includes('salmon')) {
            category = 'meat';
          } else if (combined.includes('juice') || combined.includes('soda') || combined.includes('drink') || combined.includes('water') || combined.includes('coffee') || combined.includes('tea')) {
            category = 'beverages';
          } else if (combined.includes('rice') || combined.includes('grain') || combined.includes('cereal') || combined.includes('wheat') || combined.includes('oats') || combined.includes('quinoa')) {
            category = 'grains';
          } else if (combined.includes('carrot') || combined.includes('vegetable') || combined.includes('tomato') || combined.includes('lettuce') || combined.includes('onion') || combined.includes('potato') || combined.includes('pepper') || combined.includes('broccoli') || combined.includes('spinach') || combined.includes('cabbage') || combined.includes('cucumber')) {
            category = 'vegetables';
          }
        }
        
        categorizedProducts[category].push(product);
      });
      
      // Set all category states
      setProducts(categorizedProducts.products);
      setBakery(categorizedProducts.bakery);
      setFruits(categorizedProducts.fruits);
      setDairy(categorizedProducts.dairy);
      setMeat(categorizedProducts.meat);
      setBeverages(categorizedProducts.beverages);
      setGrains(categorizedProducts.grains);
      setVegetables(categorizedProducts.vegetables);
      
      console.log('Categorized products:', {
        products: categorizedProducts.products.length,
        bakery: categorizedProducts.bakery.length,
        fruits: categorizedProducts.fruits.length,
        dairy: categorizedProducts.dairy.length,
        meat: categorizedProducts.meat.length,
        beverages: categorizedProducts.beverages.length,
        grains: categorizedProducts.grains.length,
        vegetables: categorizedProducts.vegetables.length
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Use comprehensive mock data to demonstrate all categories
      const mockProducts = [
        // Bakery items
        { id: 1, name: 'Fresh Bread', description: 'Daily baked whole wheat bread', price: 2.50, category: 'bakery' },
        { id: 2, name: 'Chocolate Cake', description: 'Rich chocolate layer cake', price: 12.99, category: 'bakery' },
        { id: 3, name: 'Croissants', description: 'Buttery French pastries', price: 4.50, category: 'bakery' },
        { id: 4, name: 'Bagels', description: 'Fresh sesame bagels', price: 3.99, category: 'bakery' },
        
        // Fruits
        { id: 11, name: 'Red Apples', description: 'Fresh organic red apples', price: 3.00, category: 'fruits' },
        { id: 12, name: 'Bananas', description: 'Ripe yellow bananas', price: 2.50, category: 'fruits' },
        { id: 13, name: 'Orange Pack', description: 'Pack of 6 juicy oranges', price: 4.99, category: 'fruits' },
        { id: 14, name: 'Strawberries', description: 'Fresh strawberry basket', price: 5.50, category: 'fruits' },
        
        // Dairy
        { id: 21, name: 'Whole Milk', description: 'Fresh whole milk 1 gallon', price: 4.50, category: 'dairy' },
        { id: 22, name: 'Cheddar Cheese', description: 'Sharp cheddar cheese block', price: 6.99, category: 'dairy' },
        { id: 23, name: 'Greek Yogurt', description: 'Plain Greek yogurt', price: 5.99, category: 'dairy' },
        { id: 24, name: 'Butter', description: 'Unsalted butter stick', price: 3.50, category: 'dairy' },
        
        // Meat
        { id: 31, name: 'Chicken Breast', description: 'Fresh boneless chicken breast', price: 8.00, category: 'meat' },
        { id: 32, name: 'Ground Beef', description: 'Lean ground beef 1lb', price: 7.50, category: 'meat' },
        { id: 33, name: 'Salmon Fillet', description: 'Fresh Atlantic salmon', price: 12.99, category: 'meat' },
        { id: 34, name: 'Pork Chops', description: 'Bone-in pork chops', price: 9.99, category: 'meat' },
        
        // Beverages
        { id: 41, name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 3.50, category: 'beverages' },
        { id: 42, name: 'Cola', description: 'Classic cola 2L bottle', price: 2.99, category: 'beverages' },
        { id: 43, name: 'Bottled Water', description: 'Spring water 24-pack', price: 4.99, category: 'beverages' },
        { id: 44, name: 'Coffee Beans', description: 'Premium arabica coffee beans', price: 8.99, category: 'beverages' },
        
        // Grains
        { id: 51, name: 'Brown Rice', description: 'Organic brown rice 2lb bag', price: 5.00, category: 'grains' },
        { id: 52, name: 'Whole Wheat Pasta', description: 'Whole wheat spaghetti', price: 2.99, category: 'grains' },
        { id: 53, name: 'Oatmeal', description: 'Steel-cut oats container', price: 4.50, category: 'grains' },
        { id: 54, name: 'Quinoa', description: 'Organic quinoa 1lb bag', price: 7.99, category: 'grains' },
        
        // Vegetables
        { id: 61, name: 'Fresh Carrots', description: 'Organic baby carrots', price: 2.00, category: 'vegetables' },
        { id: 62, name: 'Tomatoes', description: 'Vine-ripened tomatoes', price: 3.50, category: 'vegetables' },
        { id: 63, name: 'Lettuce', description: 'Fresh romaine lettuce head', price: 2.99, category: 'vegetables' },
        { id: 64, name: 'Bell Peppers', description: 'Mixed colored bell peppers', price: 4.99, category: 'vegetables' },
        
        // General products
        { id: 71, name: 'Cleaning Supplies', description: 'All-purpose cleaning kit', price: 12.00, category: 'products' },
        { id: 72, name: 'Paper Towels', description: 'Absorbent paper towels 8-pack', price: 9.99, category: 'products' },
        { id: 73, name: 'Batteries', description: 'AA alkaline batteries 12-pack', price: 8.50, category: 'products' },
        { id: 74, name: 'Dish Soap', description: 'Ultra concentrated dish soap', price: 3.99, category: 'products' }
      ];
      
      // Categorize mock data
      const categorizedMock = {
        products: mockProducts.filter(p => p.category === 'products'),
        bakery: mockProducts.filter(p => p.category === 'bakery'),
        fruits: mockProducts.filter(p => p.category === 'fruits'),
        dairy: mockProducts.filter(p => p.category === 'dairy'),
        meat: mockProducts.filter(p => p.category === 'meat'),
        beverages: mockProducts.filter(p => p.category === 'beverages'),
        grains: mockProducts.filter(p => p.category === 'grains'),
        vegetables: mockProducts.filter(p => p.category === 'vegetables')
      };
      
      setProducts(categorizedMock.products);
      setBakery(categorizedMock.bakery);
      setFruits(categorizedMock.fruits);
      setDairy(categorizedMock.dairy);
      setMeat(categorizedMock.meat);
      setBeverages(categorizedMock.beverages);
      setGrains(categorizedMock.grains);
      setVegetables(categorizedMock.vegetables);
      
      console.log('Using comprehensive mock data:', {
        products: categorizedMock.products.length,
        bakery: categorizedMock.bakery.length,
        fruits: categorizedMock.fruits.length,
        dairy: categorizedMock.dairy.length,
        meat: categorizedMock.meat.length,
        beverages: categorizedMock.beverages.length,
        grains: categorizedMock.grains.length,
        vegetables: categorizedMock.vegetables.length
      });
    }
    
    // Additional safety: Directly fetch vegetables from new endpoint
    try {
      const vegetablesResponse = await axios.get(`${API}/vegetables`);
      if (vegetablesResponse.data && Array.isArray(vegetablesResponse.data) && vegetablesResponse.data.length > 0) {
        console.log(`✅ Fetched ${vegetablesResponse.data.length} vegetables from direct endpoint`);
        setVegetables(vegetablesResponse.data);
      }
    } catch (vegError) {
      console.log('ℹ️ Direct vegetables endpoint not available:', vegError.message);
    }
  }
  
  async function fetchUserFavourites() {
    if (!user || user.guest) return;
    
    try {
      const response = await axios.get(`${API}/favourites/${user.id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      // Backend favourites might not have category info, so we need to enrich them
      const backendFavourites = response.data || [];
      console.log('📥 Fetched favourites from backend:', backendFavourites.length);
      
      // Try to match with current products to get category info
      const enrichedFavourites = (Array.isArray(backendFavourites) ? backendFavourites : []).map(fav => {
        // If favourite already has category, keep it
        if (fav.category) return fav;
        
        // Otherwise, try to find it in our product arrays to get the category
        const allCurrentProducts = [
          ...products, ...bakery, ...fruits, ...dairy, 
          ...meat, ...beverages, ...grains, ...vegetables
        ];
        
        const foundProduct = allCurrentProducts.find(p => p.id === fav.id);
        if (foundProduct) {
          return { ...fav, category: foundProduct.category };
        }
        
        return fav;
      });
      
      setFavourites(enrichedFavourites);
    } catch (error) {
      console.log('Error fetching favourites:', error);
      // Fallback to localStorage if backend fails
      const savedFavourites = localStorage.getItem(`favourites_${user.id}`);
      if (savedFavourites) {
        try {
          setFavourites(JSON.parse(savedFavourites));
        } catch (e) {
          console.log('Error loading favourites from localStorage:', e);
        }
      }
    }
  }
  
  function fetchProducts(){ 
    // Try new Category API first, fallback to old endpoint
    axios.get(`${API}/categories/products`)
      .then(r => {
        if (r.data.success && r.data.products) {
          console.log('✅ Fetched products from Category API:', r.data.products.length);
          setProducts(r.data.products);
        } else {
          // Fallback to old endpoint
          return axios.get(`${API}/products`);
        }
      })
      .then(r => {
        if (r && r.data) {
          console.log('✅ Fetched products from old endpoint:', r.data.length);
          setProducts(r.data);
        }
      })
      .catch(err => {
        console.error('❌ Failed to fetch products:', err.message);
      });
  }

  // New Category API Functions
  async function fetchCategories() {
    try {
      const response = await axios.get(`${API}/categories`);
      if (response.data.success && response.data.categories) {
        console.log('✅ Fetched categories:', response.data.categories);
        return response.data.categories;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error.message);
      return [];
    }
  }

  async function fetchCategoryProducts(categoryName) {
    try {
      const response = await axios.get(`${API}/categories/${categoryName.toLowerCase()}`);
      if (response.data.success && response.data.products) {
        console.log(`✅ Fetched ${categoryName} products:`, response.data.products.length);
        return {
          products: response.data.products,
          category: response.data.category,
          icon: response.data.icon,
          count: response.data.count
        };
      }
      return null;
    } catch (error) {
      console.error(`❌ Failed to fetch ${categoryName} products:`, error.message);
      return null;
    }
  }

  async function searchProducts(query) {
    if (!query || query.trim().length < 2) {
      console.warn('⚠️ Search query too short');
      return [];
    }
    
    try {
      const response = await axios.get(`${API}/categories/search?q=${encodeURIComponent(query)}`);
      if (response.data.success && response.data.results) {
        console.log(`✅ Found ${response.data.totalResults} results for "${query}"`);
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('❌ Search error:', error.message);
      return [];
    }
  }

  async function fetchCategoryStats() {
    try {
      const response = await axios.get(`${API}/categories/stats`);
      if (response.data.success && response.data.stats) {
        console.log('✅ Category statistics loaded:', response.data.stats);
        return response.data.stats;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error.message);
      return null;
    }
  }
  
  function addToCart(p){ 
    if (user?.guest) {
      showPopupMsg('Please sign in to add items to cart');
      return;
    }
    
    // Ensure product has category field for stock management
    const productWithCategory = {
      ...p,
      category: p.category || determineProductCategory(p)
    };
    
    console.log('🛒 Adding to cart:', productWithCategory.name, 'Category:', productWithCategory.category);
    setCart(prev => [...prev, productWithCategory]); 
  }
  
  // Helper function to determine product category
  function determineProductCategory(product) {
    // If product already has category, use it
    if (product.category) {
      return product.category.toLowerCase();
    }
    
    // Try to determine from product properties or current page
    // Check which state array contains this product
    if (bakery.some(p => p.id === product.id)) return 'bakery';
    if (fruits.some(p => p.id === product.id)) return 'fruits';
    if (dairy.some(p => p.id === product.id)) return 'dairy';
    if (meat.some(p => p.id === product.id)) return 'meat';
    if (beverages.some(p => p.id === product.id)) return 'beverages';
    if (grains.some(p => p.id === product.id)) return 'grains';
    if (vegetables.some(p => p.id === product.id)) return 'vegetables';
    
    // Default to products category
    console.warn('⚠️ Could not determine category for product:', product.name, '- defaulting to "products"');
    return 'products';
  }
  
  function removeFromCart(index){ 
    setCart(prev => prev.filter((_, i) => i !== index)); 
  }
  
  function updateCartQuantity(index, newQty){ 
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => (Array.isArray(prev) ? prev : []).map((item, i) => 
      i === index ? { ...item, cartQty: newQty } : item
    )); 
  }
  
  async function toggleFavourite(product) {
    if (user?.guest) {
      showPopupMsg('Please sign in to add items to favourites');
      return;
    }
    
    // Check if already favourite - prioritize ID match, category is secondary
    const isAlreadyFavourite = favourites.some(fav => {
      // If both have categories, match both ID and category
      if (fav.category && product.category) {
        return fav.id === product.id && 
               (fav.category || '').toLowerCase() === (product.category || '').toLowerCase();
      }
      // Otherwise just match by ID
      return fav.id === product.id;
    });
    
    console.log('Toggle favourite:', { 
      productId: product.id, 
      productCategory: product.category,
      isAlreadyFavourite,
      currentFavourites: (Array.isArray(favourites) ? favourites : []).map(f => ({ id: f.id, category: f.category }))
    });
    
    try {
      if (isAlreadyFavourite) {
        // Remove from favourites - call backend
        await axios.delete(`${API}/favourites/${user.id}/${product.id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        // Remove - match by ID primarily, category secondarily
        setFavourites(prev => prev.filter(fav => {
          if (fav.category && product.category) {
            return !(fav.id === product.id && 
                   (fav.category || '').toLowerCase() === (product.category || '').toLowerCase());
          }
          return fav.id !== product.id;
        }));
        showPopupMsg('Removed from favourites');
      } else {
        // Add to favourites - call backend
        await axios.post(`${API}/favourites`, 
          { userId: user.id, productId: product.id },
          { headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }}
        );
        setFavourites(prev => [...prev, product]);
        showPopupMsg('Added to favourites');
      }
    } catch (error) {
      console.error('Error updating favourites:', error);
      
      // Handle 409 Conflict - item already in favourites
      if (error.response?.status === 409) {
        // If backend says it's already a favourite, sync the frontend state
        const alreadyInState = favourites.some(fav => 
          fav.id === product.id && 
          (fav.category || '').toLowerCase() === (product.category || '').toLowerCase()
        );
        
        if (!alreadyInState) {
          // Add to frontend state to sync
          setFavourites(prev => [...prev, product]);
        }
        showPopupMsg('Already in favourites');
      } else {
        showPopupMsg(error.response?.data?.message || 'Failed to update favourites. Please try again.');
      }
    }
  }
  
  function isInFavourites(productId, productCategory) {
    // Strict matching: both ID and category must match
    const result = favourites.some(fav => {
      const idMatch = fav.id === productId;
      
      // If both have categories, require exact match
      if (fav.category && productCategory) {
        const categoryMatch = (fav.category || '').toLowerCase() === (productCategory || '').toLowerCase();
        const matches = idMatch && categoryMatch;
        
        if (matches) {
          console.log('✅ Favourite match found:', { 
            productId, 
            productCategory, 
            favId: fav.id, 
            favCategory: fav.category 
          });
        }
        
        return matches;
      }
      
      // If favourite has category but product doesn't (or vice versa), only match ID
      // This handles edge cases where category info might be missing
      return idMatch;
    });
    
    return result;
  }
  
  function register(){
    if (!form.username || !form.email || !form.password || !form.address || !form.phone) {
      showPopupMsg('Please fill in all fields: username, email, password, address, and phone number.');
      return;
    }
    axios.post(
      API+'/auth/register',
      {
        username: form.username,
        email: form.email,
        password: form.password,
        address: form.address,
        phone: form.phone
      },
      {headers:{'Content-Type':'application/json'}}
    )
    .then(()=>{
      showPopupMsg('Registered successfully! Please login with your credentials.');
      // Reset form and go back to login/register selection
      setForm({username:'',email:'',password:'',address:'',phone:''});
      setShowRegister(false);
      setShowLogin(false);
      setShowManagerLogin(false);
      setShowManagerRegister(false);
    })
    .catch(e=>{
      let msg = e.response?.data?.message || e.response?.data || e.message || 'error';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      showPopupMsg('Register failed: '+msg);
    });
  }
  function login() {
    if (!form.email || !form.password) {
      showPopupMsg('Please enter email and password');
      return;
    }

    console.log('🔍 Universal login attempt:', { email: form.email });

    // First try customer login
    axios.post(API + '/auth/login', { email: form.email, password: form.password })
      .then(r => {
        console.log('✅ Customer login successful:', r.data);
        if (!r.data || !r.data.id) throw new Error('Invalid login response');
        
        // Set as customer
        r.data.userType = 'customer';
        setUser(r.data);
        setShowLogin(false);
        setForm({});
        setPage('home'); // Automatically go to homepage after login
        showPopupMsg(`Welcome back, ${r.data.username || r.data.name}!`);
      })
      .catch(customerError => {
        console.log('❌ Customer login failed, trying employee login...');
        
        // If customer login fails, try employee login
        axios.post(API + '/auth/employee-login', { email: form.email, password: form.password })
          .then(r => {
            console.log('✅ Employee login successful:', r.data);
            const employeeData = r.data;
            
            // Validate employee response structure
            if (!employeeData.userType || employeeData.userType !== 'employee') {
              throw new Error('Invalid employee login response');
            }
            
            // Validate role exists
            if (!employeeData.role) {
              throw new Error('Employee role not found in response');
            }
            
            // Process employee login using existing function
            processEmployeeLogin(employeeData);
            setShowLogin(false);
            setForm({});
            
          })
          .catch(employeeError => {
            console.log('❌ Both customer and employee login failed');
            console.error('Customer error:', customerError);
            console.error('Employee error:', employeeError);
            
            // Show appropriate error message
            let msg = 'Invalid email or password. Please check your credentials.';
            if (employeeError.response?.status === 401 || customerError.response?.status === 401) {
              msg = 'Invalid email or password.';
            } else if (employeeError.response?.data?.error) {
              msg = employeeError.response.data.error;
            } else if (customerError.response?.data?.error) {
              msg = customerError.response.data.error;
            }
            
            showPopupMsg(msg);
          });
      });
  }
  const [orderNotes, setOrderNotes] = useState('');

  // Show login/register form if not logged in
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showManagerLogin, setShowManagerLogin] = useState(false);
  const [showManagerRegister, setShowManagerRegister] = useState(false);
  function managerRegister(){
    if (!form.username || !form.email || !form.password || !form.address || !form.phone) {
      showPopupMsg('Please fill in all fields: username, email, password, address, and phone number.');
      return;
    }
    axios.post(
      API+'/auth/register',
      {
        username: form.username,
        email: form.email,
        password: form.password,
        address: form.address,
        phone: form.phone,
        role: 'manager'
      },
      {headers:{'Content-Type':'application/json'}}
    )
    .then(()=>{
      showPopupMsg('Manager registered successfully! Please login with your credentials.');
      // Reset form and go back to login/register selection
      setForm({username:'',email:'',password:'',address:'',phone:''});
      setShowRegister(false);
      setShowLogin(false);
      setShowManagerLogin(false);
      setShowManagerRegister(false);
    })
    .catch(e=>{
      let msg = e.response?.data?.message || e.response?.data || e.message || 'error';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      showPopupMsg('Manager register failed: '+msg);
    });
  }
  function managerLogin() {
    if (!form.email || !form.password) {
      showPopupMsg('Please enter both email and password to login as manager.');
      return;
    }
    axios.post(
      API+'/auth/login',
      {email:form.email,password:form.password},
      {headers:{'Content-Type':'application/json'}}
    )
    .then(r => {
      if (!r.data || !r.data.email || !r.data.role) {
        showPopupMsg('Login succeeded but user info is missing or incomplete!');
        setUser(null);
      } else if (r.data.role !== 'manager') {
        showPopupMsg('Only managers can login here.');
        setUser(null);
      } else {
        setUser(r.data);
      }
    })
    .catch(e=>{
      let msg = e.response?.data?.message || e.response?.data || e.message || 'invalid';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      showPopupMsg('Login failed: '+msg);
    });
  }
  const [editingProductId, setEditingProductId] = useState(null);
  const [showProductCrud, setShowProductCrud] = useState(false);

  // Add state to control user CRUD section visibility
  const [showUserCrud, setShowUserCrud] = useState(false);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  function fetchUsers() {
    if (!user || user.role !== 'manager' || !user.id) return;
    setLoadingUsers(true);
    setUserError("");
    axios.get(API + '/auth', { headers: { 'user-id': user.id } })
      .then(r => setUsers(r.data))
      .catch(e => {
        setUsers([]);
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Fetch users failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        setUserError(msg);
      })
      .finally(() => setLoadingUsers(false));
  }

  function viewUser(userId) {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can view user details.');
      return;
    }
    axios.get(`${API}/auth/${userId}`, { headers: { 'user-id': user.id } })
      .then(r => setViewedUser(r.data))
      .catch(e => {
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'View user failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  function updateUser() {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can update users.');
      return;
    }
    if (!editingUserId) return;
    // Only send fields that are present in userForm
    const payload = {};
    ['username','email','role','phone','address','password'].forEach(f => {
      if (userForm[f] !== undefined) payload[f] = userForm[f];
    });
    axios.put(`${API}/auth/${editingUserId}`, payload, { headers: { 'user-id': user.id } })
      .then(() => {
        showPopupMsg('User updated');
        setEditingUserId(null);
        setUserForm({});
        fetchUsers();
      })
      .catch(e => {
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Update user failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  function deleteUser(userId) {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can delete users.');
      return;
    }
    axios.delete(`${API}/auth/${userId}`, { headers: { 'user-id': user.id } })
      .then(() => {
        showPopupMsg('User deleted');
        fetchUsers();
      })
      .catch(e => {
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Delete user failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  // Add state to control employee CRUD section visibility
  const [showEmployeeCrud, setShowEmployeeCrud] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({name:'',address:'',phone:'',birthdate:'',role:'',email:'',password:''});
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState("");

  function fetchEmployees() {
    // Authorization check - only managers and payment handlers can fetch employees
    if (!user || user.guest || (user.role !== 'manager' && employee?.role !== 'Payment Handler')) {
      console.log('❌ Unauthorized fetchEmployees call prevented for:', { 
        userRole: user?.role, 
        employeeRole: employee?.role,
        isGuest: user?.guest 
      });
      setEmployees([]); // Ensure employees is empty for unauthorized users
      setLoadingEmployees(false);
      setEmployeeError("Not authorized to view employees");
      return;
    }
    
    setLoadingEmployees(true);
    setEmployeeError("");
    
    if (!user || !user.id) {
      console.log('No user available for fetching employees');
      setLoadingEmployees(false);
      return;
    }
    
    console.log('✅ Authorized employee fetch for user-id:', user.id, 'role:', user.role);
    
    axios.get(API + '/employees', { 
      headers: { 
        'Content-Type': 'application/json',
        'user-id': user.id.toString() 
      } 
    })
      .then(r => {
        console.log('Employees fetched successfully:', r.data);
        // Safety check: ensure we're setting an array
        if (Array.isArray(r.data)) {
          setEmployees(r.data);
        } else {
          console.warn('Employees data is not an array:', r.data);
          setEmployees([]);
        }
        setEmployeeError(""); // Clear any previous errors
      })
      .catch(e => {
        console.error('Fetch employees error:', e);
        console.error('Error response:', e.response?.data);
        console.error('Error status:', e.response?.status);
        
        setEmployees([]);
        
        // Only show error if user is a manager or if they're trying to access employee management
        if (user.role === 'manager' || showEmployeeCrud) {
          let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Fetch employees failed';
          if (typeof msg === 'object') msg = JSON.stringify(msg);
          setEmployeeError(`Failed to load employees: ${msg}`);
        } else {
          // For non-managers, just log the error but don't show it to user
          console.log('Employee fetch failed for non-manager user, this is expected');
        }
      })
      .finally(() => setLoadingEmployees(false));
  }

  function addEmployee() {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can add employees.');
      return;
    }
    const { name, address, phone, birthdate, role, email, password } = employeeForm;
    if (!name || !address || !phone || !birthdate || !role || !email || !password) {
      showPopupMsg('Please fill in all employee fields including email and password.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopupMsg('Please enter a valid email address.');
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      showPopupMsg('Password must be at least 6 characters long.');
      return;
    }
    
    // Try with email and password first - using correct API structure
    const employeeDataWithAuth = { 
      name, 
      email, 
      password, 
      role,
      address, 
      phoneNumber: phone, 
      birthdate
    };
    
    console.log('Attempting to create employee with auth data:', employeeDataWithAuth);
    
    axios.post(API + '/employees', employeeDataWithAuth, { 
      headers: { 
        'Content-Type': 'application/json',
        'user-id': user.id.toString() 
      } 
    })
      .then((response) => {
        console.log('Employee creation successful, response:', response.data);
        showPopupMsg('Employee added successfully with login credentials');
        setEmployeeForm({name:'',address:'',phone:'',birthdate:'',role:'',email:'',password:''});
        console.log('Calling fetchEmployees after successful creation...');
        setTimeout(() => fetchEmployees(), 500); // Small delay to ensure backend has processed
      })
      .catch(e => {
        console.error('Add employee with auth failed:', e);
        console.error('Error response:', e.response?.data);
        console.error('Error status:', e.response?.status);
        
        // If the API doesn't support email/password, try without them
        if (e.response?.status === 400) {
          console.log('Trying without email/password fields...');
          const basicEmployeeData = { name, address, phoneNumber: phone, birthdate, role };
          
          axios.post(API + '/employees', basicEmployeeData, { 
            headers: { 
              'Content-Type': 'application/json',
              'user-id': user.id.toString() 
            } 
          })
            .then((response) => {
              console.log('Fallback employee creation successful, response:', response.data);
              showPopupMsg(`Employee ${name} added (Note: Login credentials not set - API doesn't support email/password yet)`);
              setEmployeeForm({name:'',address:'',phone:'',birthdate:'',role:'',email:'',password:''});
              console.log('Calling fetchEmployees after fallback creation...');
              setTimeout(() => fetchEmployees(), 500); // Small delay to ensure backend has processed
            })
            .catch(fallbackError => {
              console.error('Fallback employee creation also failed:', fallbackError);
              let msg = fallbackError.response?.data?.error || fallbackError.response?.data?.message || fallbackError.response?.data || fallbackError.message || 'Add employee failed';
              if (typeof msg === 'object') msg = JSON.stringify(msg);
              showPopupMsg(`Add employee failed: ${msg}`);
            });
        } else {
          let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Add employee failed';
          if (typeof msg === 'object') msg = JSON.stringify(msg);
          showPopupMsg(`Add employee failed: ${msg}`);
        }
      });
  }

  function deleteEmployee(id) {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can delete employees.');
      return;
    }
    axios.delete(`${API}/employees/${id}`, { 
      headers: { 
        'Content-Type': 'application/json',
        'user-id': user.id.toString() 
      } 
    })
      .then(() => {
        showPopupMsg('Employee deleted');
        fetchEmployees();
      })
      .catch(e => {
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Delete employee failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  function updateEmployee() {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can update employees.');
      return;
    }
    if (!editingEmployeeId) return;
    const { name, address, phone, birthdate, role, email, password } = employeeForm;
    if (!name || !address || !phone || !birthdate || !role || !email) {
      showPopupMsg('Please fill in all required employee fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopupMsg('Please enter a valid email address.');
      return;
    }
    
    // Password validation (optional for updates - only validate if provided)
    if (password && password.length < 6) {
      showPopupMsg('Password must be at least 6 characters long.');
      return;
    }
    
    const updateData = { 
      name, 
      email,
      role, 
      address, 
      phoneNumber: phone, 
      birthdate
    };
    
    // Only include password if it's provided
    if (password) {
      updateData.password = password;
    }
    
    console.log('Attempting to update employee with data:', updateData);
    
    axios.put(`${API}/employees/${editingEmployeeId}`, updateData, { 
      headers: { 
        'Content-Type': 'application/json',
        'user-id': user.id.toString() 
      } 
    })
      .then(() => {
        showPopupMsg('Employee updated successfully');
        setEditingEmployeeId(null);
        setEmployeeForm({name:'',address:'',phone:'',birthdate:'',role:'',email:'',password:''});
        fetchEmployees();
      })
      .catch(e => {
        console.error('Update employee error:', e);
        console.error('Error response:', e.response?.data);
        
        // If the API doesn't support email/password, try without them
        if (e.response?.status === 400) {
          console.log('Trying update without email/password fields...');
          const basicUpdateData = { 
            name, 
            address, 
            phoneNumber: phone, 
            birthdate, 
            role 
          };
          
          axios.put(`${API}/employees/${editingEmployeeId}`, basicUpdateData, { headers: { 'user-id': user.id } })
            .then(() => {
              showPopupMsg('Employee updated (Note: Email/password not updated - API doesn\'t support these fields yet)');
              setEditingEmployeeId(null);
              setEmployeeForm({name:'',address:'',phone:'',birthdate:'',role:'',email:'',password:''});
              fetchEmployees();
            })
            .catch(fallbackError => {
              console.error('Fallback employee update also failed:', fallbackError);
              let msg = fallbackError.response?.data?.error || fallbackError.response?.data?.message || fallbackError.response?.data || fallbackError.message || 'Update employee failed';
              if (typeof msg === 'object') msg = JSON.stringify(msg);
              showPopupMsg(`Update employee failed: ${msg}`);
            });
        } else {
          let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Update employee failed';
          if (typeof msg === 'object') msg = JSON.stringify(msg);
          showPopupMsg(`Update employee failed: ${msg}`);
        }
      });
  }

  // Add state to control order CRUD section visibility
  const [showOrderCrud, setShowOrderCrud] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderForm, setOrderForm] = useState({status:'',deliveryAddress:''});
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [viewedOrder, setViewedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState("");

  // User orders state (for individual users to view their orders)
  const [userOrders, setUserOrdersRaw] = useState([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);
  const [userOrderError, setUserOrderError] = useState("");
  const [viewedUserOrder, setViewedUserOrder] = useState(null);
  
  // Safe wrapper for setUserOrders that ALWAYS ensures an array
  const setUserOrders = (data) => {
    const safeData = Array.isArray(data) ? data : [];
    console.log('🛡️ setUserOrders called with:', typeof data, 'length:', data?.length, 'isArray:', Array.isArray(data), '→ setting:', safeData.length, 'items');
    setUserOrdersRaw(safeData);
  };

  // Employee login state
  const [showEmployeeLogin, setShowEmployeeLogin] = useState(false);
  const [employeeLoginForm, setEmployeeLoginForm] = useState({email:'', password:''});
  const [employee, setEmployee] = useState(null);
  const [loginType, setLoginType] = useState('customer'); // 'customer', 'employee', 'manager'

  function fetchOrders() {
    // Allow both managers and payment handlers to fetch orders
    const isManager = user && user.role === 'manager' && user.id;
    const isPaymentHandler = employee && employee.role === 'Payment Handler' && employee.id;
    
    if (!isManager && !isPaymentHandler) {
      console.log('⚠️ Not authorized to fetch orders. isManager:', isManager, 'isPaymentHandler:', isPaymentHandler);
      return;
    }
    
    setLoadingOrders(true);
    setOrderError("");
    
    // Use manager's ID if manager, or employee's ID if payment handler
    const userId = isManager ? user.id : employee.id;
    
    console.log('🔍 Fetching orders with:', {
      isManager,
      isPaymentHandler,
      userId,
      userRole: user?.role,
      employeeRole: employee?.role
    });
    
    // Payment Handlers use a different endpoint to get pending payment orders
    const endpoint = isPaymentHandler ? API + '/payments/pending' : API + '/orders';
    
    console.log('📡 Using endpoint:', endpoint);
    
    axios.get(endpoint, { headers: { 'user-id': userId } })
      .then(r => {
        console.log('📦 Raw response data:', r.data);
        console.log('📦 Response data type:', typeof r.data);
        console.log('📦 Is array?', Array.isArray(r.data));
        
        // Check if response contains an error
        if (r.data && typeof r.data === 'object' && r.data.error) {
          console.error('❌ Backend returned error:', r.data.error);
          setOrderError(r.data.error);
          setOrders([]);
          setLoadingOrders(false);
          return;
        }
        
        // Handle different response formats
        let ordersData = r.data;
        
        // If response is an object with an orders property
        if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
          if (r.data.orders && Array.isArray(r.data.orders)) {
            ordersData = r.data.orders;
            console.log('📦 Extracted orders array from response object');
          } else if (r.data.data && Array.isArray(r.data.data)) {
            ordersData = r.data.data;
            console.log('📦 Extracted data array from response object');
          } else {
            console.error('❌ Response is object but no orders array found. Keys:', Object.keys(r.data));
            console.error('❌ Full response:', r.data);
            const errorMsg = r.data.message || r.data.error || 'Invalid response format from server';
            setOrderError(errorMsg);
            ordersData = [];
          }
        }
        
        // Ensure we have an array
        if (!Array.isArray(ordersData)) {
          console.error('❌ Orders data is not an array:', ordersData);
          ordersData = [];
        }
        
        console.log('✅ Orders fetched successfully:', ordersData.length, 'total orders');
        
        if (ordersData.length > 0) {
          // Log first order to see structure
          console.log('� Sample order structure:', ordersData[0]);
          
          console.log('�💳 Bank payment orders:', ordersData.filter(o => o.paymentMethod === 'bank').length);
          console.log('⏳ Orders in review:', ordersData.filter(o => o.status === 'review').length);
          console.log('✓ Orders placed:', ordersData.filter(o => o.status === 'placed').length);
          console.log('✗ Orders rejected:', ordersData.filter(o => o.status === 'rejected').length);
          
          // Log sample order data to verify receipt field
          const firstOrder = ordersData[0];
          if (firstOrder) {
            console.log('📋 First order details:', {
              id: firstOrder.id,
              status: firstOrder.status,
              orderStatus: firstOrder.orderStatus,
              paymentMethod: firstOrder.paymentMethod,
              paymentStatus: firstOrder.paymentStatus,
              hasReceipt: !!firstOrder.paymentReceipt,
              receiptPreview: firstOrder.paymentReceipt ? firstOrder.paymentReceipt.substring(0, 50) + '...' : 'No receipt',
              allKeys: Object.keys(firstOrder)
            });
          }
        }
        
        setOrders(ordersData);
      })
      .catch(e => {
        setOrders([]);
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Fetch orders failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        setOrderError(msg);
        console.error('❌ Fetch orders error:', msg);
      })
      .finally(() => setLoadingOrders(false));
  }

  function viewOrder(orderId) {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can view order details.');
      return;
    }
    axios.get(`${API}/orders/${orderId}`, { headers: { 'user-id': user.id } })
      .then(r => setViewedOrder(r.data))
      .catch(e => {
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'View order failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  // User orders functions
  function fetchUserOrders() {
    if (!user || user.guest || !user.id) return;
    setLoadingUserOrders(true);
    setUserOrderError("");
    
    console.log('🔍 Fetching orders for user:', user.id);
    
    // Safety wrapper to ensure we only set arrays
    const safeSetUserOrders = (data) => {
      const orders = Array.isArray(data) ? data : [];
      console.log('🛡️ Setting user orders (safe):', orders.length, 'orders');
      setUserOrders(orders);
    };
    
    // Try multiple endpoints to find the correct one
    const tryEndpoint = (endpoint, description) => {
      console.log(`🌐 Trying ${description}: ${endpoint}`);
      return axios.get(endpoint, { headers: { 'user-id': user.id } });
    };
    
    // First try the customer-specific endpoint
    tryEndpoint(`${API}/orders/users/${user.id}`, 'customer-specific endpoint')
      .then(r => {
        console.log('✅ Orders API response (customer-specific):', r.data);
        // Handle different response formats
        let orders = [];
        if (Array.isArray(r.data)) {
          orders = r.data;
        } else if (r.data && Array.isArray(r.data.orders)) {
          orders = r.data.orders;
        } else if (r.data && Array.isArray(r.data.data)) {
          orders = r.data.data;
        }
        safeSetUserOrders(orders);
        console.log(`✅ Successfully loaded ${orders.length} orders`);
      })
      .catch(e1 => {
        console.log('⚠️ Customer-specific endpoint failed, trying general orders endpoint...');
        
        // Fallback to general orders endpoint with filtering
        tryEndpoint(`${API}/orders`, 'general orders endpoint')
          .then(r => {
            console.log('✅ Orders API response (general):', r.data);
            let allOrders = Array.isArray(r.data) ? r.data : [];
            
            // Filter orders for current user
            const userOrders = allOrders.filter(order => 
              order.user_id === user.id || 
              order.userId === user.id ||
              order.customerId === user.id ||
              order.customer_id === user.id
            );
            
            console.log(`✅ Filtered ${userOrders.length} orders from ${allOrders.length} total orders`);
            safeSetUserOrders(userOrders);
          })
          .catch(e2 => {
            console.log('⚠️ General endpoint failed, trying query parameter approach...');
            
            // Try with query parameter
            tryEndpoint(`${API}/orders?user_id=${user.id}`, 'query parameter endpoint')
              .then(r => {
                console.log('✅ Orders API response (query param):', r.data);
                const orders = Array.isArray(r.data) ? r.data : [];
                safeSetUserOrders(orders);
                console.log(`✅ Successfully loaded ${orders.length} orders via query param`);
              })
              .catch(e3 => {
                console.error('❌ All endpoints failed:', { e1: e1.message, e2: e2.message, e3: e3.message });
                safeSetUserOrders([]);
                
                // Provide detailed error message
                let msg = 'Unable to fetch your orders. ';
                if (e3.response?.status === 404) {
                  msg += 'The orders service may not be available.';
                } else if (e3.response?.status === 401) {
                  msg += 'Please login again to view your orders.';
                } else if (e3.response?.status === 403) {
                  msg += 'You do not have permission to view orders.';
                } else {
                  msg += (e3.response?.data?.error || e3.response?.data?.message || e3.message || 'Unknown error occurred');
                }
                
                setUserOrderError(msg);
              });
          });
      })
      .finally(() => setLoadingUserOrders(false));
  }

  function viewUserOrder(orderId) {
    if (!user || user.guest || !user.id) {
      showPopupMsg('Please login to view order details');
      return;
    }
    
    console.log('🔍 Viewing order:', orderId, 'for user:', user.id);
    
    // Try to find the order in the already fetched orders first
    const existingOrder = userOrders.find(order => order.id == orderId); // Use == for type flexibility
    if (existingOrder) {
      console.log('✅ Found order in local cache:', existingOrder);
      setViewedUserOrder(existingOrder);
      return;
    }
    
    console.log('⚠️ Order not in cache, fetching from server...');
    
    // If not found, fetch from server with multiple endpoint attempts
    const tryOrderEndpoint = (endpoint, description) => {
      console.log(`🌐 Trying ${description}: ${endpoint}`);
      return axios.get(endpoint, { headers: { 'user-id': user.id } });
    };
    
    // First try the specific order endpoint
    tryOrderEndpoint(`${API}/orders/${orderId}`, 'specific order endpoint')
      .then(r => {
        console.log('✅ Order API response:', r.data);
        const order = r.data;
        
        // Verify this order belongs to the current user (with flexible field matching)
        const belongsToUser = order.user_id == user.id || 
                             order.userId == user.id ||
                             order.customerId == user.id ||
                             order.customer_id == user.id;
        
        if (belongsToUser) {
          console.log('✅ Order belongs to user, displaying details');
          setViewedUserOrder(order);
        } else {
          console.warn('❌ Order does not belong to current user:', {
            orderId,
            orderUserId: order.user_id || order.userId || order.customerId || order.customer_id,
            currentUserId: user.id
          });
          showPopupMsg('You can only view your own orders.');
        }
      })
      .catch(e => {
        console.error('❌ Failed to fetch order details:', e);
        
        // Try to find the order in user's order list as fallback
        if (userOrders.length > 0) {
          const fallbackOrder = userOrders.find(order => order.id == orderId);
          if (fallbackOrder) {
            console.log('✅ Found order in user orders list as fallback');
            setViewedUserOrder(fallbackOrder);
            return;
          }
        }
        
        // Provide specific error messages
        let msg = 'Failed to view order details. ';
        if (e.response?.status === 404) {
          msg += 'Order not found or may have been deleted.';
        } else if (e.response?.status === 401) {
          msg += 'Please login again to view order details.';
        } else if (e.response?.status === 403) {
          msg += 'You do not have permission to view this order.';
        } else {
          msg += (e.response?.data?.error || e.response?.data?.message || e.message || 'Unknown error occurred');
        }
        
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  // Test function for employee login
  function testEmployeeLogin() {
    console.log('Testing employee login...');
    employeeLogin({
      email: 'alex.rodriguez@grocery.com',
      password: 'password'
    });
  }

  // Employee login functions
  function employeeLogin(credentials = null) {
    console.log('🔍 DEBUG: employeeLogin function called');
    console.log('🔍 DEBUG: credentials parameter:', credentials);
    console.log('🔍 DEBUG: credentials type:', typeof credentials);
    console.log('🔍 DEBUG: credentials is SyntheticEvent?', credentials && credentials._reactName ? 'YES' : 'NO');
    
    if (credentials && credentials._reactName) {
      console.error('❌ ERROR: Received SyntheticEvent instead of credentials! This indicates onClick={employeeLogin} instead of onClick={() => employeeLogin()}');
      showPopupMsg('Login error: Invalid function call. Please report this bug.');
      return;
    }
    
    const loginData = credentials || employeeLoginForm;
    
    console.log('Employee login called with:', loginData);
    console.log('employeeLoginForm state:', employeeLoginForm);
    
    if (!loginData.email || !loginData.password) {
      showPopupMsg('Please enter email and password');
      return;
    }

    // For API login, we don't need role - it comes from the server response
    // Role is only needed for demo logins

    // Check if it's demo login or real API login
    if (loginData.email.includes('demo.com')) {
      // Demo login - create mock employee data
      const employeeData = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: loginData.email,
        name: loginData.role === 'Delivery' ? 'Alex Rodriguez' : 
              loginData.role === 'Worker' ? 'John Smith' : 
              'Sarah Wilson',
        role: loginData.role,
        userType: 'employee'
      };
      
      // Process the demo login
      processEmployeeLogin(employeeData);
      return;
    }

    // Real API login - use the correct endpoint and payload format
    console.log('Attempting employee login with:', { email: loginData.email });
    console.log('Full loginData received:', loginData);
    console.log('API payload (email + password only):', { email: loginData.email, password: loginData.password });
    
    axios.post(API + '/auth/employee-login', {
      email: loginData.email,
      password: loginData.password
    }, {
      headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
      console.log('Employee login successful:', response.data);
      const employeeData = response.data;
      
      // Validate response structure
      if (!employeeData.userType || employeeData.userType !== 'employee') {
        showPopupMsg('Invalid employee login response');
        return;
      }
      
      // Validate role exists
      if (!employeeData.role) {
        showPopupMsg('Employee role not found in response');
        return;
      }
      
      processEmployeeLogin(employeeData);
    })
    .catch(error => {
      console.error('Employee login error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Employee not found.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      showPopupMsg(errorMessage);
    });
  }

  function processEmployeeLogin(employeeData) {
    console.log('Processing employee login:', employeeData);
    console.log('Available roles:', Object.values(EMPLOYEE_ROLES));
    console.log('Employee role received:', employeeData.role);
    console.log('Employee role type:', typeof employeeData.role);
    console.log('Role comparison results:');
    Object.values(EMPLOYEE_ROLES).forEach(role => {
      console.log(`  "${role}" === "${employeeData.role}": ${role === employeeData.role}`);
    });
    
    // Validate role
    if (!Object.values(EMPLOYEE_ROLES).includes(employeeData.role)) {
      console.error('Role validation failed. Expected one of:', Object.values(EMPLOYEE_ROLES), 'Got:', employeeData.role);
      console.error('Full employee data:', JSON.stringify(employeeData, null, 2));
      showPopupMsg(`Invalid employee role: "${employeeData.role}". Expected one of: ${Object.values(EMPLOYEE_ROLES).join(', ')}`);
      return;
    }

    // Set employee data
    employeeData.userType = 'employee';
    setEmployee(employeeData);
    setUser(employeeData);
    setShowEmployeeLogin(false);
    setEmployeeLoginForm({email:'', password:''});
    
    // Store in localStorage
    localStorage.setItem('employeeData', JSON.stringify(employeeData));
    localStorage.setItem('userId', employeeData.id.toString());
    localStorage.setItem('userType', 'employee');
    localStorage.setItem('employeeId', employeeData.id.toString());
    localStorage.setItem('employeeName', employeeData.name);
    localStorage.setItem('employeeRole', employeeData.role);
    
    showPopupMsg(`Welcome ${employeeData.name}! Logged in as ${ROLE_CONFIG[employeeData.role]?.displayName}`);
    
    // Set appropriate page based on role
    if (employeeData.role === EMPLOYEE_ROLES.DELIVERY) {
      setPage('employee-delivery');
    } else if (employeeData.role === EMPLOYEE_ROLES.WORKER) {
      setPage('employee-worker');  
    } else if (employeeData.role === EMPLOYEE_ROLES.PAYMENT_HANDLER) {
      setPage('employee-payments');
    } else {
      setPage('employee-dashboard');
    }
  }

  // Handle API login errors separately
  function handleEmployeeLoginError(e) {
      let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Employee login failed';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      showPopupMsg(msg);
  }

  function getEmployeePermissions() {
    if (!employee || !employee.role) return null;
    return ROLE_CONFIG[employee.role]?.permissions || null;
  }

  function updateOrder() {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can update orders.');
      return;
    }
    if (!editingOrderId) return;
    const { status, deliveryAddress } = orderForm;
    axios.put(`${API}/orders/${editingOrderId}`, { status, deliveryAddress }, { headers: { 'user-id': user.id } })
      .then(() => {
        showPopupMsg('Order updated');
        setEditingOrderId(null);
        setOrderForm({status:'',deliveryAddress:''});
        fetchOrders();
      })
      .catch(e => {
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Update order failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  function deleteOrder(orderId) {
    if (!user || user.role !== 'manager' || !user.id) {
      showPopupMsg('Only managers can delete orders.');
      return;
    }
    axios.delete(`${API}/orders/${orderId}`, { headers: { 'user-id': user.id } })
      .then(() => {
        showPopupMsg('Order deleted');
        fetchOrders();
      })
      .catch(e => {
        let msg = e.response?.data?.error || e.response?.data?.message || e.response?.data || e.message || 'Delete order failed';
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        showPopupMsg(msg);
      });
  }

  const [popupMsg, setPopupMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  function showPopupMsg(msg) {
    setPopupMsg(msg);
    setShowPopup(true);
    setTimeout(()=>setShowPopup(false), 2500);
  }

  // Auto-set as guest if no user
  React.useEffect(() => {
    if (!user) {
      setUser({ guest: true });
    }
  }, []);

  // Fetch orders when Payment Handler opens dashboard
  React.useEffect(() => {
    if (page === 'employee-payments' && employee && employee.role === 'Payment Handler') {
      console.log('Payment Handler dashboard opened - fetching orders...');
      fetchOrders();
    }
  }, [page, employee]);

  // Show login modal if user wants to sign in from guest mode
  if(!user || (showLogin || showRegister || showManagerLogin || showManagerRegister)){
    return (
  <div style={{fontFamily:'Nunito, Open Sans, Arial',padding:0,margin:0,minHeight:'100vh',background:'url("/FoodMart-1.0.0/images/bg-leaves-img-pattern.png") repeat, linear-gradient(135deg,#f8fafc 0%,#e3f2fd 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',borderRadius:20,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',padding:48,minWidth:340,maxWidth:400,width:'100%',border:'1px solid #eee',position:'relative'}}>
          <img src="/FoodMart-1.0.0/images/logo.png" alt="Shanthi Stores Logo" style={{width:80,display:'block',margin:'0 auto 18px'}}/>
          <h1 style={{textAlign:'center',color:'#7b1fa2',marginBottom:24,fontWeight:700,letterSpacing:1,fontFamily:'Nunito'}}>Shanthi Stores</h1>
          <div style={{marginBottom:10, display:'flex', flexDirection:'column', gap:18}}>
            {(!showLogin && !showRegister && !showManagerLogin && !showManagerRegister) && (
              <div style={{display:'flex', gap:16,justifyContent:'center'}}>
                <button onClick={()=>{setShowLogin(true); setShowRegister(false); setShowManagerLogin(false); setShowManagerRegister(false); setForm({username:'',email:'',password:'',address:'',phone:''});}} style={{padding:'14px 36px',fontSize:20,borderRadius:10,background:'#1976d2',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px rgba(25,118,210,0.12)',transition:'0.2s'}}>Sign In</button>
                <button onClick={()=>{setShowRegister(true); setShowLogin(false); setShowManagerLogin(false); setShowManagerRegister(false); setForm({username:'',email:'',password:'',address:'',phone:''});}} style={{padding:'14px 36px',fontSize:20,borderRadius:10,background:'#7b1fa2',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px rgba(123,31,162,0.12)',transition:'0.2s'}}>Sign Up</button>
                <button onClick={() => setUser({guest: true})} style={{padding:'14px 36px',fontSize:20,borderRadius:10,background:'#4caf50',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px rgba(76,175,80,0.12)',transition:'0.2s',marginTop:'12px',width:'100%'}}>Browse as Guest</button>
              </div>
            )}
            {showLogin && !showRegister && !showManagerLogin && (
              <>
                <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{padding:'14px',fontSize:18,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontFamily:'Open Sans'}}/>
                <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{padding:'14px',fontSize:18,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontFamily:'Open Sans'}}/>
                <div style={{display:'flex', gap:16,justifyContent:'center'}}>
                  <button onClick={login} style={{padding:'12px 32px',fontSize:18,borderRadius:8,background:'#1976d2',color:'#fff',border:'none',fontWeight:700}}>Sign In</button>
                  <button onClick={()=>{setShowLogin(false); setForm({username:'',email:'',password:'',address:'',phone:''});}} style={{padding:'12px 32px',fontSize:18,borderRadius:8,background:'#eee',color:'#333',border:'none',fontWeight:700}}>Back</button>
                </div>
              </>
            )}
            {showRegister && !showLogin && !showManagerLogin && !showManagerRegister && (
              <>
                <input placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} style={{padding:'14px',fontSize:18,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontFamily:'Open Sans'}}/>
                <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{padding:'14px',fontSize:18,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontFamily:'Open Sans'}}/>
                <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{padding:'14px',fontSize:18,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontFamily:'Open Sans'}}/>
                <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{padding:'14px',fontSize:18,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontFamily:'Open Sans'}}/>
                <input placeholder="Phone Number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{padding:'14px',fontSize:18,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontFamily:'Open Sans'}}/>
                <div style={{display:'flex', gap:16,justifyContent:'center'}}>
                  <button onClick={register} style={{padding:'12px 32px',fontSize:18,borderRadius:8,background:'#7b1fa2',color:'#fff',border:'none',fontWeight:700}}>Sign Up</button>
                  <button onClick={()=>{setShowRegister(false); setForm({username:'',email:'',password:'',address:'',phone:''});}} style={{padding:'12px 32px',fontSize:18,borderRadius:8,background:'#eee',color:'#333',border:'#000',fontWeight:700}}>Back</button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Employee Login Modal
  if (showEmployeeLogin) {
    return (
      <div style={{fontFamily:'Nunito, Arial',minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:'#fff',borderRadius:16,padding:40,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{fontSize:48,marginBottom:16}}>👷</div>
            <h2 style={{margin:0,color:'#333',fontSize:28,fontWeight:700}}>Employee Login</h2>
            <p style={{color:'#666',marginTop:8,fontSize:16}}>Access your staff dashboard</p>
          </div>

          {/* Quick Demo Login Buttons */}
          <div style={{marginBottom:24}}>
            <p style={{fontSize:14,color:'#666',marginBottom:12,textAlign:'center'}}>Quick Demo Login:</p>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button 
                onClick={() => employeeLogin({email:'alex.rodriguez@grocery.com', password:'password', role:'Delivery'})}
                style={{padding:'8px 12px',border:'1px solid #28a745',borderRadius:6,background:'#f8f9fa',cursor:'pointer',fontSize:12,color:'#28a745',fontWeight:600}}
              >
                🚚 Delivery Staff (Alex Rodriguez)
              </button>
              <button 
                onClick={() => employeeLogin({email:'sarah.johnson@grocery.com', password:'password', role:'Worker'})}
                style={{padding:'8px 12px',border:'1px solid #007bff',borderRadius:6,background:'#f8f9fa',cursor:'pointer',fontSize:12,color:'#007bff',fontWeight:600}}
              >
                👷 Store Worker (Sarah Johnson)
              </button>
              <button 
                onClick={() => employeeLogin({email:'lisa.davis@grocery.com', password:'password', role:'Payment Handler'})}
                style={{padding:'8px 12px',border:'1px solid #ffc107',borderRadius:6,background:'#f8f9fa',cursor:'pointer',fontSize:12,color:'#e68900',fontWeight:600}}
              >
                💰 Payment Handler (Lisa Davis)
              </button>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{display:'block',marginBottom:8,color:'#333',fontWeight:600,fontSize:14}}>Email</label>
            <input
              type="email"
              value={employeeLoginForm.email}
              onChange={e => setEmployeeLoginForm(prev => ({...prev, email: e.target.value}))}
              style={{width:'100%',padding:'12px 16px',border:'2px solid #e9ecef',borderRadius:8,fontSize:16,transition:'border-color 0.2s'}}
              placeholder="Enter your work email"
            />
          </div>

          <div style={{marginBottom:24}}>
            <label style={{display:'block',marginBottom:8,color:'#333',fontWeight:600,fontSize:14}}>Password</label>
            <input
              type="password"
              value={employeeLoginForm.password}
              onChange={e => setEmployeeLoginForm(prev => ({...prev, password: e.target.value}))}
              style={{width:'100%',padding:'12px 16px',border:'2px solid #e9ecef',borderRadius:8,fontSize:16,transition:'border-color 0.2s'}}
              placeholder="Enter your password"
            />
          </div>

          <div style={{display:'flex',gap:12}}>
            <button
              onClick={() => employeeLogin()}
              style={{flex:1,padding:'12px 24px',background:'linear-gradient(135deg,#ff9800 0%,#f57c00 100%)',color:'#fff',border:'none',borderRadius:8,fontSize:16,fontWeight:700,cursor:'pointer',transition:'transform 0.2s'}}
            >
              Login as Staff
            </button>
            <button
              onClick={() => setShowEmployeeLogin(false)}
              style={{padding:'12px 24px',background:'#6c757d',color:'#fff',border:'none',borderRadius:8,fontSize:16,fontWeight:600,cursor:'pointer'}}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main app after login
  const isEmployeePage = employee && (page === 'employee-delivery' || page === 'employee-worker' || page === 'employee-payments');
  
  return (
    <div style={{fontFamily:'Arial',minHeight:'100vh',display:'flex',flexDirection:'column',background:isEmployeePage ? '#0f0f0f' : 'transparent'}}>
      {showPopup && (
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:isEmployeePage ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.98), rgba(20, 20, 20, 0.95))' : '#fff',backdropFilter:isEmployeePage ? 'blur(20px) saturate(180%)' : 'none',color:isEmployeePage ? 'rgba(255, 255, 255, 0.95)' : '#333',padding:'32px 48px',borderRadius:16,boxShadow:isEmployeePage ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(122, 183, 48, 0.3)' : '0 8px 32px rgba(0,0,0,0.18)',border:isEmployeePage ? '1px solid rgba(122, 183, 48, 0.3)' : 'none',zIndex:9999,fontSize:20,fontWeight:600,transition:'opacity 0.3s',opacity:showPopup?1:0,textShadow:isEmployeePage ? '0 2px 4px rgba(0, 0, 0, 0.5)' : 'none'}}>
          {popupMsg}
        </div>
      )}
      
      {/* Global Header - Only on Homepage */}
      {page === 'home' && (
        <>
        <div style={{background:'#fff',borderBottom:'1px solid #eee',fontSize:16,position:'relative',zIndex:100000}}>
        <div style={{width:'100%',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:20}}>
          {/* Logo Section */}
          <div style={{display:'flex',alignItems:'center',gap:12,minWidth:'250px'}}>
            <img src="/FoodMart-1.0.0/images/logo.png" alt="FoodMart logo" style={{height:50}} />
            <div>
              <div style={{fontWeight:700,fontSize:22,color:'#333',lineHeight:1}}>FOOD<span style={{color:'#ffa726'}}>MART</span></div>
              <div style={{fontSize:12,color:'#888',textTransform:'uppercase',letterSpacing:1}}>GROCERY STORE</div>
            </div>
          </div>
          

          
          {/* Right Section */}
          <div style={{display:'flex',alignItems:'center',gap:16,minWidth:'300px'}}>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:12,color:'#888'}}>For Support?</div>
              <div style={{fontWeight:700,color:'#333',fontSize:16}}>+980-34984089</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              {!user || user?.guest ? (
                // No user or Guest user - Show Sign In, Sign Up, and Staff buttons
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <button 
                    onClick={() => {setShowLogin(true); setShowRegister(false); setShowManagerLogin(false); setShowManagerRegister(false); setForm({username:'',email:'',password:'',address:'',phone:''});}}
                    style={{
                      padding:'8px 16px',
                      backgroundColor:'#1976d2',
                      color:'#fff',
                      border:'none',
                      borderRadius:'6px',
                      fontSize:'14px',
                      fontWeight:'600',
                      cursor:'pointer',
                      transition:'all 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#1565c0'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#1976d2'}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => {setShowRegister(true); setShowLogin(false); setShowManagerLogin(false); setShowManagerRegister(false); setForm({username:'',email:'',password:'',address:'',phone:''});}}
                    style={{
                      padding:'8px 16px',
                      backgroundColor:'#7b1fa2',
                      color:'#fff',
                      border:'none',
                      borderRadius:'6px',
                      fontSize:'14px',
                      fontWeight:'600',
                      cursor:'pointer',
                      transition:'all 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#6a1b9a'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#7b1fa2'}
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                // Logged in user - Show account, favorites, and cart
                <>
                  <div style={{width:40,height:40,borderRadius:'50%',backgroundColor:'#f8f9fa',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} onClick={() => setPage('account')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div style={{width:40,height:40,borderRadius:'50%',backgroundColor:'#f8f9fa',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} onClick={() => setPage('favourites')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
                      <path d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>

                  <div 
                    style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}
                    onClick={() => setShowCartModal(true)}
                  >
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:14,fontWeight:600,color:'#333'}}>
                        Your Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
                      </div>
                      <div style={{fontSize:20,fontWeight:700,color:'#ffa726'}}>Rs. {cart.reduce((s,p)=>s+p.price*(p.cartQty||1),0).toFixed(2)}</div>
                    </div>
                <div style={{position:'relative'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#333">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {cart.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {cart.length}
                    </div>
                  )}
                </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div style={{backgroundColor:'#f8f9fa',borderBottom:'1px solid #eee', position:'relative', zIndex:100000}}>
        <div style={{width:'100%',padding:'0 24px', position:'relative'}}>
          <div style={{display:'flex',alignItems:'center',gap:24,overflowX:'auto',whiteSpace:'nowrap', position:'relative', overflowY:'visible'}}>
            <span 
              style={{color:'#333',fontWeight:500,cursor:'pointer',padding:'12px 0',whiteSpace:'nowrap',fontSize:16,transition:'color 0.2s'}}
              onClick={() => setPage('products')}
              onMouseEnter={e => e.target.style.color = '#f9a825'}
              onMouseLeave={e => e.target.style.color = '#333'}
            >
              Products
            </span>
            {!user?.guest && (
              <>
                <span 
                  style={{color:'#333',fontWeight:500,cursor:'pointer',padding:'12px 0',whiteSpace:'nowrap',fontSize:16,transition:'color 0.2s'}}
                  onClick={() => setPage('account')}
                  onMouseEnter={e => e.target.style.color = '#f9a825'}
                  onMouseLeave={e => e.target.style.color = '#333'}
                >
                  My Account
                </span>
                <span 
                  style={{color:'#333',fontWeight:500,cursor:'pointer',padding:'12px 0',whiteSpace:'nowrap',fontSize:16,transition:'color 0.2s'}}
                  onClick={() => setPage('favourites')}
                  onMouseEnter={e => e.target.style.color = '#f9a825'}
                  onMouseLeave={e => e.target.style.color = '#333'}
                >
                  Favourites
                </span>
                <span 
                  style={{color:'#333',fontWeight:500,cursor:'pointer',padding:'12px 0',whiteSpace:'nowrap',fontSize:16,transition:'color 0.2s'}}
                  onClick={() => setPage('orders')}
                  onMouseEnter={e => e.target.style.color = '#f9a825'}
                  onMouseLeave={e => e.target.style.color = '#333'}
                >
                  My Orders
                </span>
                <span 
                  style={{color:'#333',fontWeight:500,cursor:'pointer',padding:'12px 0',whiteSpace:'nowrap',fontSize:16,transition:'color 0.2s'}}
                  onClick={() => setPage('blogs')}
                  onMouseEnter={e => e.target.style.color = '#f9a825'}
                  onMouseLeave={e => e.target.style.color = '#333'}
                >
                  Blogs
                </span>
              </>
            )}
          </div>
        </div>
      </div>
        </>
      )}



      {/* Header for Other Pages */}
      {page !== 'home' && (
        <div style={{background:isEmployeePage ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.98), rgba(20, 20, 20, 0.95))' : '#fff',backdropFilter:isEmployeePage ? 'blur(20px) saturate(180%)' : 'none',borderBottom:isEmployeePage ? '2px solid rgba(122, 183, 48, 0.3)' : '1px solid #eee',fontSize:16,padding:'16px 0',boxShadow:isEmployeePage ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(122, 183, 48, 0.2)' : 'none'}}>
          <div style={{textAlign:'center',cursor:'pointer'}} onClick={() => setPage('home')}>
            <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
              <img src="/FoodMart-1.0.0/images/logo.png" alt="Shanthi Stores logo" style={{height:40,filter:isEmployeePage ? 'drop-shadow(0 0 10px rgba(122, 183, 48, 0.3))' : 'none'}} />
              <div style={{fontWeight:700,fontSize:22,color:isEmployeePage ? 'rgba(255, 255, 255, 0.95)' : '#333',fontFamily:'Nunito, sans-serif',textShadow:isEmployeePage ? '0 2px 4px rgba(0, 0, 0, 0.5)' : 'none'}}>
                SHANTHI <span style={{color:'#ffa726',textShadow:isEmployeePage ? '0 0 20px rgba(255, 167, 38, 0.5)' : 'none'}}>STORES</span> - GROCERY STORE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{flex:1}}>

        {page==='products' && (
        <section style={{padding:'40px 0'}}>
          <div style={{maxWidth:'1200px', margin:'0 auto', padding:'0 20px'}}>
            <div style={{marginBottom:'40px'}}>
              {/* ...existing code... */}

              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
                <h2 style={{fontSize:'28px', fontWeight:'700', color:'#333', margin:0}}>
                  {selectedCategory === 'all' ? 'All Products' : 
                   selectedCategory === 'products' ? '🛒 General Products' :
                   selectedCategory === 'bakery' ? '🥖 Bakery Items' :
                   selectedCategory === 'fruits' ? '🍎 Fruits' :
                   selectedCategory === 'dairy' ? '🥛 Dairy Products' :
                   selectedCategory === 'meat' ? '🥩 Meat' :
                   selectedCategory === 'beverages' ? '🥤 Beverages' :
                   selectedCategory === 'grains' ? '🌾 Grains & Cereals' :
                   selectedCategory === 'vegetables' ? '🥕 Vegetables' :
                   selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </h2>
                <div style={{display:'flex', alignItems:'center', gap:'0', maxWidth:'600px', width:'100%'}}>
                  <div style={{display:'flex',border:'1px solid #ddd',borderRadius:8,overflow:'hidden', width:'100%'}}>
                    <select 
                      value={selectedCategory} 
                      onChange={e => {
                        setSelectedCategory(e.target.value);
                      }}
                      style={{
                        border:'none',
                        padding:'12px 16px',
                        backgroundColor:'#f8f9fa',
                        fontSize:14,
                        minWidth:140,
                        outline:'none'
                      }}
                    >
                      <option value="all">All Categories</option>
                      <option value="products">🛒 General Products</option>
                      <option value="bakery">🥖 Bakery Items</option>
                      <option value="fruits">🍎 Fruits</option>
                      <option value="dairy">🥛 Dairy Products</option>
                      <option value="meat">🥩 Meat</option>
                      <option value="beverages">🥤 Beverages</option>
                      <option value="grains">🌾 Grains & Cereals</option>
                      <option value="vegetables">🥕 Vegetables</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search for more than 20,000 products"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{
                        flex:1,
                        border:'none',
                        padding:'12px 16px',
                        fontSize:14,
                        outline:'none'
                      }}
                    />
                    <button style={{
                      backgroundColor:'#ffa726',
                      border:'none',
                      padding:'12px 16px',
                      color:'#fff',
                      cursor:'pointer'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <span style={{fontSize:'14px', color:'#666'}}>
                  {(() => {
                    const allProducts = selectedCategory === 'all' 
                      ? [...products, ...bakery, ...fruits, ...dairy, ...meat, ...beverages, ...grains, ...vegetables]
                      : selectedCategory === 'products' ? products
                      : selectedCategory === 'bakery' ? bakery
                      : selectedCategory === 'fruits' ? fruits
                      : selectedCategory === 'dairy' ? dairy
                      : selectedCategory === 'meat' ? meat
                      : selectedCategory === 'beverages' ? beverages
                      : selectedCategory === 'grains' ? grains
                      : selectedCategory === 'vegetables' ? vegetables
                      : [];
                    
                    return allProducts.filter(p =>
                      p.name.toLowerCase().includes(search.toLowerCase()) ||
                      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
                    ).length;
                  })()} products found
                </span>
              </div>
            </div>
              
              <div key={selectedCategory} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'20px'}}>
                {(() => {
                  const safeArray = (arr) => Array.isArray(arr) ? arr : [];
                  const allProducts = selectedCategory === 'all' 
                    ? [...safeArray(products), ...safeArray(bakery), ...safeArray(fruits), ...safeArray(dairy), ...safeArray(meat), ...safeArray(beverages), ...safeArray(grains), ...safeArray(vegetables)]
                    : selectedCategory === 'products' ? safeArray(products)
                    : selectedCategory === 'bakery' ? safeArray(bakery)
                    : selectedCategory === 'fruits' ? safeArray(fruits)
                    : selectedCategory === 'dairy' ? safeArray(dairy)
                    : selectedCategory === 'meat' ? safeArray(meat)
                    : selectedCategory === 'beverages' ? safeArray(beverages)
                    : selectedCategory === 'grains' ? safeArray(grains)
                    : selectedCategory === 'vegetables' ? safeArray(vegetables)
                    : [];
                  
                  // ...existing code...
                  
                  return (Array.isArray(allProducts) ? allProducts : [])
                    .filter(p =>
                      p.name && p.name.toLowerCase().includes(search.toLowerCase()) ||
                      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
                    )
                    .map((product, i) => {
                      const pid = product.id || i;
                      const qty = qtys[pid] || 1;
                      // Create unique key using category and id to avoid duplicate keys across categories
                      const uniqueKey = `${product.category || 'product'}-${product.id || i}`;
                      return (
                      <div key={uniqueKey} style={{background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',padding:'16px',position:'relative',minHeight:'320px',display:'flex',flexDirection:'column',border:'1px solid #f0f0f0'}}>
                        {/* Discount badge */}
                        <span style={{position:'absolute',top:'12px',left:'12px',background:'#4CAF50',color:'#fff',fontWeight:'600',padding:'4px 8px',borderRadius:'6px',fontSize:'12px',zIndex:2}}>-30%</span>
                        
                        {/* Heart icon */}
                        <div 
                          style={{
                            position:'absolute',
                            top:'12px',
                            right:'12px',
                            width:'32px',
                            height:'32px',
                            background:'#fff',
                            borderRadius:'50%',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            cursor:'pointer',
                            boxShadow:'0 2px 4px rgba(0,0,0,0.1)',
                            zIndex:2,
                            transition:'all 0.2s'
                          }}
                          onClick={() => toggleFavourite(product)}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={isInFavourites(product.id, product.category) ? "#ff4757" : "none"} stroke={isInFavourites(product.id, product.category) ? "#ff4757" : "#ccc"} strokeWidth="2">
                            <path d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                        
                        {/* Product image */}
                        <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'140px',marginBottom:'12px',borderRadius:'8px',backgroundColor:'#fafafa'}}>
                          <img 
                            src={
                              product.image || 
                              (product.name && product.name.toLowerCase().includes('tomato') ? 
                                (product.name.toLowerCase().includes('ketchup') ? 
                                  '/FoodMart-1.0.0/images/thumb-tomatoketchup.png' : 
                                  '/FoodMart-1.0.0/images/thumb-tomatoes.png'
                                ) : 
                                '/FoodMart-1.0.0/images/thumb-bananas.png'
                              )
                            } 
                            alt={product.name || 'Product'} 
                            style={{maxHeight:'120px',maxWidth:'100%',objectFit:'contain'}} 
                          />
                        </div>
                        
                        {/* Product name */}
                        <h3 style={{fontWeight:'600',fontSize:'16px',color:'#333',marginBottom:'8px',lineHeight:'1.4'}}>{product.name}</h3>
                        
                        {/* Unit and rating */}
                        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
                          <span style={{fontSize:'12px',color:'#888',fontWeight:'500'}}>1 UNIT</span>
                          <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB400">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            <span style={{fontSize:'12px',fontWeight:'600',color:'#333'}}>4.5</span>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div style={{fontSize:'20px',fontWeight:'700',color:'#333',marginBottom:'16px'}}>Rs. {product.price ? product.price.toFixed(2) : '18.00'}</div>
                        
                        {/* Quantity controls and Add to Cart */}
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'auto'}}>
                          <button 
                            type="button" 
                            style={{width:'32px',height:'32px',border:'1px solid #ddd',background:'#fff',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'18px',fontWeight:'500',color:'#666'}} 
                            onClick={() => setQtys(q => ({ ...q, [pid]: Math.max(1, (q[pid] || 1) - 1) }))}
                          >
                            −
                          </button>
                          <span style={{fontWeight:'600',fontSize:'16px',minWidth:'24px',textAlign:'center',color:'#333'}}>{qty}</span>
                          <button 
                            type="button" 
                            style={{width:'32px',height:'32px',border:'1px solid #ddd',background:'#fff',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'18px',fontWeight:'500',color:'#666'}} 
                            onClick={() => setQtys(q => ({ ...q, [pid]: (q[pid] || 1) + 1 }))}
                          >
                            +
                          </button>
                          <button 
                            style={{flex:1,marginLeft:'12px',background:'#f8f9fa',color:'#666',fontWeight:'500',fontSize:'14px',padding:'8px 16px',border:'1px solid #e9ecef',borderRadius:'6px',cursor:'pointer',transition:'all 0.2s'}} 
                            onClick={() => addToCart({ ...product, cartQty: qty })}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })
                })()}
              </div>
            </div>
        </section>
      )}



        {/* Professional Cart Modal */}
        {showCartModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90%',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Header */}
              <div style={{
                padding: '24px 24px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#f9a825'
                }}>Your cart</h2>
                <button 
                  onClick={() => setShowCartModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Cart Items */}
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: cart.length > 0 ? '16px 24px' : '40px 24px'
              }}>
                {cart.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '16px'
                  }}>
                    Your cart is empty
                  </div>
                ) : (
                  (Array.isArray(cart) ? cart : []).map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 0',
                      borderBottom: index < cart.length - 1 ? '1px solid #f0f0f0' : 'none',
                      gap: '16px'
                    }}>
                      {/* Product Image */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <div style={{ color: '#999', fontSize: '12px' }}>IMG</div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '8px'
                        }}>
                          Brief description
                        </div>
                        
                        {/* Quantity Controls */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => updateCartQuantity(index, (item.cartQty || 1) - 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: '1px solid #ddd',
                              background: '#fff',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: '#666'
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            minWidth: '20px',
                            textAlign: 'center'
                          }}>
                            {item.cartQty || 1}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(index, (item.cartQty || 1) + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: '1px solid #ddd',
                              background: '#fff',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: '#666'
                            }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(index)}
                            style={{
                              marginLeft: '8px',
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              fontSize: '12px',
                              textDecoration: 'underline'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Rs. {(item.price * (item.cartQty || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div style={{
                  padding: '16px 24px 24px',
                  borderTop: '1px solid #f0f0f0',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#666'
                    }}>
                      Total (Rupees)
                    </span>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#333'
                    }}>
                      Rs. {cart.reduce((sum, item) => sum + (item.price * (item.cartQty || 1)), 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowCartModal(false);
                      setPage('cart');
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #f9a825 0%, #f57c00 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(249, 168, 37, 0.3)'
                    }}
                    onMouseEnter={e => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(249, 168, 37, 0.4)';
                    }}
                    onMouseLeave={e => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(249, 168, 37, 0.3)';
                    }}
                  >
                    Continue to checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {page==='cart' && <div style={{
          fontFamily:'Nunito, Open Sans, Arial',
          padding:'40px 24px',
          margin:0,
          minHeight:'70vh',
          background:'linear-gradient(135deg,#f8fafc 0%,#e3f2fd 100%)'
        }}>
          <div style={{
            maxWidth:'800px',
            margin:'0 auto',
            background:'#fff',
            borderRadius:'12px',
            padding:'40px',
            boxShadow:'0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              textAlign:'center',
              color:'#f9a825',
              marginBottom:'30px',
              fontWeight:'700',
              fontSize:'32px'
            }}>Checkout</h2>
            
            <div style={{marginBottom:'30px'}}>
              <h3 style={{
                fontSize:'20px',
                fontWeight:'600',
                color:'#333',
                marginBottom:'16px',
                borderBottom:'2px solid #f9a825',
                paddingBottom:'8px'
              }}>Order Summary</h3>
              {(Array.isArray(cart) ? cart : []).map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #eee',
                  alignItems:'center'
                }}>
                  <span style={{fontSize:'15px',color:'#555'}}>{item.name} × {item.cartQty || 1}</span>
                  <span style={{fontSize:'16px',fontWeight:'600',color:'#333'}}>Rs. {(item.price * (item.cartQty || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 0',
                fontSize: '20px',
                fontWeight: '700',
                color:'#333',
                borderTop:'2px solid #f0f0f0',
                marginTop:'8px'
              }}>
                <span>Total:</span>
                <span style={{color:'#f9a825'}}>Rs. {cart.reduce((s,p)=>s+p.price*(p.cartQty||1),0).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Payment Method Selection */}
            <div style={{marginBottom:'30px'}}>
              <h3 style={{
                fontSize:'20px',
                fontWeight:'600',
                color:'#333',
                marginBottom:'16px',
                borderBottom:'2px solid #f9a825',
                paddingBottom:'8px'
              }}>Payment Method</h3>
              
              <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
                {/* Cash on Delivery Option */}
                <div 
                  onClick={() => setPaymentMethod('cash')}
                  style={{
                    flex:'1',
                    minWidth:'200px',
                    padding:'20px',
                    border: paymentMethod === 'cash' ? '3px solid #f9a825' : '2px solid #ddd',
                    borderRadius:'12px',
                    cursor:'pointer',
                    background: paymentMethod === 'cash' ? '#fff9e6' : '#fff',
                    transition:'all 0.3s ease',
                    position:'relative',
                    boxShadow: paymentMethod === 'cash' ? '0 4px 12px rgba(249,168,37,0.2)' : '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  {paymentMethod === 'cash' && (
                    <div style={{
                      position:'absolute',
                      top:'8px',
                      right:'8px',
                      width:'24px',
                      height:'24px',
                      borderRadius:'50%',
                      background:'#f9a825',
                      color:'#fff',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:'14px',
                      fontWeight:'700'
                    }}>✓</div>
                  )}
                  <div style={{fontSize:'32px',marginBottom:'12px',textAlign:'center'}}>💵</div>
                  <div style={{fontSize:'18px',fontWeight:'600',color:'#333',textAlign:'center',marginBottom:'4px'}}>
                    Cash on Delivery
                  </div>
                  <div style={{fontSize:'13px',color:'#666',textAlign:'center'}}>
                    Pay when you receive your order
                  </div>
                </div>
                
                {/* Bank Payment Option */}
                <div 
                  onClick={() => setPaymentMethod('bank')}
                  style={{
                    flex:'1',
                    minWidth:'200px',
                    padding:'20px',
                    border: paymentMethod === 'bank' ? '3px solid #f9a825' : '2px solid #ddd',
                    borderRadius:'12px',
                    cursor:'pointer',
                    background: paymentMethod === 'bank' ? '#fff9e6' : '#fff',
                    transition:'all 0.3s ease',
                    position:'relative',
                    boxShadow: paymentMethod === 'bank' ? '0 4px 12px rgba(249,168,37,0.2)' : '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  {paymentMethod === 'bank' && (
                    <div style={{
                      position:'absolute',
                      top:'8px',
                      right:'8px',
                      width:'24px',
                      height:'24px',
                      borderRadius:'50%',
                      background:'#f9a825',
                      color:'#fff',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:'14px',
                      fontWeight:'700'
                    }}>✓</div>
                  )}
                  <div style={{fontSize:'32px',marginBottom:'12px',textAlign:'center'}}>🏦</div>
                  <div style={{fontSize:'18px',fontWeight:'600',color:'#333',textAlign:'center',marginBottom:'4px'}}>
                    Bank Payment
                  </div>
                  <div style={{fontSize:'13px',color:'#666',textAlign:'center'}}>
                    Pay via bank transfer or card
                  </div>
                </div>
              </div>
              
              {/* Payment Method Info */}
              {paymentMethod === 'bank' && (
                <div style={{
                  marginTop:'16px',
                  padding:'16px',
                  background:'#e3f2fd',
                  borderRadius:'8px',
                  border:'1px solid #90caf9'
                }}>
                  <div style={{fontSize:'14px',color:'#1976d2',marginBottom:'8px'}}>
                    <strong>💳 Bank Payment Instructions:</strong>
                  </div>
                  <div style={{fontSize:'13px',color:'#555',lineHeight:'1.6',marginBottom:'12px'}}>
                    Please transfer the amount to the following bank account and upload your payment receipt:
                  </div>
                  <div style={{
                    background:'#fff',
                    padding:'12px',
                    borderRadius:'6px',
                    marginBottom:'16px'
                  }}>
                    <div style={{fontSize:'13px',color:'#333',marginBottom:'4px'}}>
                      <strong>Bank Name:</strong> Example Bank
                    </div>
                    <div style={{fontSize:'13px',color:'#333',marginBottom:'4px'}}>
                      <strong>Account Name:</strong> Grocery Store Ltd
                    </div>
                    <div style={{fontSize:'13px',color:'#333',marginBottom:'4px'}}>
                      <strong>Account Number:</strong> 1234567890
                    </div>
                    <div style={{fontSize:'13px',color:'#333'}}>
                      <strong>Branch:</strong> Main Branch
                    </div>
                  </div>
                  
                  {/* Receipt Upload */}
                  <div style={{marginTop:'16px'}}>
                    <label style={{
                      display:'block',
                      fontSize:'14px',
                      fontWeight:'600',
                      color:'#1976d2',
                      marginBottom:'8px'
                    }}>
                      📤 Upload Payment Receipt (Required):
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      style={{
                        width:'100%',
                        padding:'10px',
                        border:'2px dashed #90caf9',
                        borderRadius:'6px',
                        fontSize:'14px',
                        cursor:'pointer',
                        background:'#fff'
                      }}
                    />
                    {receiptPreview && (
                      <div style={{
                        marginTop:'12px',
                        textAlign:'center'
                      }}>
                        <div style={{fontSize:'12px',color:'#558b2f',marginBottom:'8px',fontWeight:'600'}}>
                          ✓ Receipt uploaded successfully
                        </div>
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          style={{
                            maxWidth:'100%',
                            maxHeight:'200px',
                            borderRadius:'6px',
                            boxShadow:'0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {paymentMethod === 'cash' && (
                <div style={{
                  marginTop:'16px',
                  padding:'16px',
                  background:'#f1f8e9',
                  borderRadius:'8px',
                  border:'1px solid #aed581'
                }}>
                  <div style={{fontSize:'14px',color:'#558b2f',marginBottom:'8px'}}>
                    <strong>💵 Cash on Delivery:</strong>
                  </div>
                  <div style={{fontSize:'13px',color:'#555',lineHeight:'1.6'}}>
                    Please keep the exact amount ready. Our delivery person will collect the payment when delivering your order.
                  </div>
                </div>
              )}
            </div>
            
            <div style={{marginBottom:'24px'}}>
              <label style={{
                display:'block',
                fontSize:'16px',
                fontWeight:'600',
                color:'#333',
                marginBottom:'8px'
              }}>Order Notes (optional):</label>
              <textarea 
                value={orderNotes} 
                onChange={e=>setOrderNotes(e.target.value)} 
                rows={3} 
                placeholder="Any special instructions or delivery notes..." 
                style={{
                  width:'100%',
                  padding:'12px',
                  border:'1px solid #ddd',
                  borderRadius:'8px',
                  fontSize:'14px',
                  fontFamily:'inherit',
                  resize:'vertical',
                  boxSizing:'border-box'
                }}
              />
            </div>
            
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <button 
                onClick={placeOrder}
                style={{
                  padding:'14px 32px',
                  background:'linear-gradient(135deg, #f9a825 0%, #f57c00 100%)',
                  color:'#fff',
                  border:'none',
                  borderRadius:'8px',
                  fontSize:'16px',
                  fontWeight:'700',
                  cursor:'pointer',
                  boxShadow:'0 4px 12px rgba(249,168,37,0.3)',
                  transition:'all 0.2s'
                }}
              >
                Place Order ({paymentMethod === 'cash' ? 'Cash on Delivery' : 'Bank Payment'})
              </button>
              <button 
                onClick={()=>setPage('home')} 
                style={{
                  padding:'14px 32px',
                  background:'#1976d2',
                  color:'#fff',
                  border:'none',
                  borderRadius:'8px',
                  fontSize:'16px',
                  fontWeight:'700',
                  cursor:'pointer',
                  boxShadow:'0 4px 12px rgba(25,118,210,0.3)',
                  transition:'all 0.2s'
                }}
              >
                Continue Shopping
              </button>
            </div>
            
            {showAddressPrompt && (
          <div style={{border:'1px solid #ccc', borderRadius:8, padding:16, marginTop:16, maxWidth:400}}>
            <div style={{marginBottom:8}}>
              <b>Do you want to deliver to your saved address?</b><br/>
              <span style={{color:'#555'}}>{(user && typeof user.address === 'string' && user.address.trim()) ? user.address.trim() : <i>No saved address</i>}</span>
            </div>
            <div style={{display:'flex', gap:12}}>
              <button onClick={()=>handleAddressChoice(true)}>Yes</button>
              <button onClick={()=>handleAddressChoice(false)}>No</button>
            </div>
          </div>
        )}
        {showCustomAddressInput && (
          <div style={{border:'1px solid #ccc', borderRadius:8, padding:16, marginTop:16, maxWidth:400}}>
            <label>Enter delivery address:
              <input type="text" value={customAddress} onChange={e=>setCustomAddress(e.target.value)} placeholder="Delivery address..." />
            </label>
            <button onClick={()=>submitOrder(customAddress, "no")} style={{marginLeft:8}}>Submit Order</button>
          </div>
        )}
          </div>
        </div>}

        {page==='admin' && (
        <div>
          <h2>Admin Dashboard</h2>
          <div style={{marginBottom:24, display:'flex', gap:16}}>
            <button onClick={()=>setShowProductCrud(v=>!v)} style={{padding:'10px 20px',fontSize:16,borderRadius:6,background:'#1976d2',color:'#fff',border:'none'}}>
              {showProductCrud ? 'Hide Product Management' : 'Manage Products'}
            </button>
            <button onClick={()=>{setShowUserCrud(v=>!v); if(!showUserCrud) fetchUsers();}} style={{padding:'10px 20px',fontSize:16,borderRadius:6,background:'#388e3c',color:'#fff',border:'none'}}>
              {showUserCrud ? 'Hide User Management' : 'Manage Users'}
            </button>
            <button onClick={()=>{setShowEmployeeCrud(v=>!v); if(!showEmployeeCrud) fetchEmployees();}} style={{padding:'10px 20px',fontSize:16,borderRadius:6,background:'#fbc02d',color:'#333',border:'none'}}>
              {showEmployeeCrud ? 'Hide Employee Management' : 'Manage Employees'}
            </button>
            <button onClick={()=>{setShowOrderCrud(v=>!v); if(!showOrderCrud) fetchOrders();}} style={{padding:'10px 20px',fontSize:16,borderRadius:6,background:'#7b1fa2',color:'#fff',border:'none'}}>
              {showOrderCrud ? 'Hide Order Management' : 'Manage Orders'}
            </button>
          </div>
          {showProductCrud && (
            <div style={{display:'flex', flexDirection:'column', gap:24, maxWidth:600, margin:'0 auto'}}>
              {/* Product Create/Edit Section */}
              <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#f9f9f9'}}>
                <h3 style={{marginTop:0}}>{editingProductId ? 'Edit Product' : 'Create Product'}</h3>
                
                {/* Drag and Drop Image Zone */}
                <div style={{marginBottom:16}}>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: isDragging ? '3px dashed #f9a825' : '2px dashed #ccc',
                      borderRadius: 12,
                      padding: 24,
                      textAlign: 'center',
                      background: isDragging ? '#fff9e6' : '#fafafa',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('imageFileInput').click()}
                  >
                    {(form.image || imagePreview) ? (
                      <div style={{position:'relative'}}>
                        <img 
                          src={form.image || imagePreview} 
                          alt="Product preview" 
                          style={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            objectFit: 'contain',
                            borderRadius: 8
                          }}
                          onError={(e) => {
                            e.target.src = '/FoodMart-1.0.0/images/product-thumb-1.png';
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#ff4757',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            fontSize: 18,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Remove image"
                        >
                          ×
                        </button>
                        <p style={{marginTop: 12, fontSize: 12, color: '#666'}}>
                          Click to change image or drag & drop a new one
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          fontSize: 48,
                          marginBottom: 8,
                          color: isDragging ? '#f9a825' : '#999'
                        }}>
                          📸
                        </div>
                        <p style={{
                          margin: '8px 0',
                          fontSize: 16,
                          fontWeight: '600',
                          color: isDragging ? '#f9a825' : '#333'
                        }}>
                          {isDragging ? 'Drop image here' : 'Drag & Drop Image Here'}
                        </p>
                        <p style={{margin: '4px 0', fontSize: 12, color: '#666'}}>
                          or click to browse
                        </p>
                        <p style={{margin: '8px 0 0', fontSize: 11, color: '#999'}}>
                          Supports: JPG, PNG, GIF, WebP (Max 5MB)
                        </p>
                      </div>
                    )}
                    <input 
                      id="imageFileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{display: 'none'}}
                    />
                  </div>
                  
                  {/* OR divider */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '16px 0',
                    gap: 8
                  }}>
                    <div style={{flex: 1, height: 1, background: '#ddd'}}></div>
                    <span style={{fontSize: 12, color: '#999', fontWeight: '600'}}>OR</span>
                    <div style={{flex: 1, height: 1, background: '#ddd'}}></div>
                  </div>
                  
                  {/* URL Input */}
                  <input 
                    placeholder="Enter Image URL (e.g., https://example.com/image.jpg)" 
                    value={form.image && !imagePreview ? form.image : ''} 
                    onChange={e=>{
                      setForm({...form,image:e.target.value});
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  
                  {/* Helper text */}
                  <div style={{
                    marginTop: 8,
                    padding: 8,
                    background: '#e3f2fd',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#1976d2'
                  }}>
                    💡 <strong>Tip:</strong> Use local images like /FoodMart-1.0.0/images/thumb-bananas.png or external URLs
                  </div>
                </div>
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                  <select 
                    value={form.category || 'products'} 
                    onChange={e=>setForm({...form,category:e.target.value})}
                    style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                  >
                    <option value="products">General Products</option>
                    <option value="bakery">Bakery Items</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy Products</option>
                    <option value="meat">Meat</option>
                    <option value="beverages">Beverages</option>
                    <option value="grains">Grains</option>
                    <option value="vegetables">Vegetables</option>
                  </select>
                  <input placeholder="Name" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/>
                  <input placeholder="Description" value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/>
                  <input placeholder="Price" type="number" value={form.price||''} onChange={e=>setForm({...form,price:parseFloat(e.target.value)})}/>
                  <input placeholder="Quantity" type="number" value={form.quantity||''} onChange={e=>setForm({...form,quantity:parseInt(e.target.value||0)})}/>
                </div>
                
                <div style={{marginTop:16, display:'flex', gap:12}}>
                  {editingProductId ? (
                    <>
                      <button onClick={()=>managerUpdateProduct(editingProductId)}>Update Product</button>
                      <button onClick={resetForm}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={managerCreateProduct}>Create Product</button>
                  )}
                </div>
              </div>
              {/* Product List Section - Separate Tables by Category */}
              <div style={{display:'flex', flexDirection:'column', gap:24}}>
                {/* General Products Table */}
                {products.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>General Products ({products.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#f8f9fa'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(products) ? products : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'products',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Bakery Items Table */}
                {bakery.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>Bakery Items ({bakery.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#fff8e1'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(bakery) ? bakery : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'bakery',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Fruits Table */}
                {fruits.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>Fruits ({fruits.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#e8f5e8'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(fruits) ? fruits : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'fruits',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Dairy Products Table */}
                {dairy.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>Dairy Products ({dairy.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#e3f2fd'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(dairy) ? dairy : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'dairy',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Meat Products Table */}
                {meat.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>Meat Products ({meat.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#fce4ec'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(meat) ? meat : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'meat',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Beverages Table */}
                {beverages.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>Beverages ({beverages.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#f3e5f5'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(beverages) ? beverages : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'beverages',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Grains Table */}
                {grains.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>Grains ({grains.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#fff3e0'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(grains) ? grains : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'grains',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Vegetables Table */}
                {vegetables.length > 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                    <h3 style={{margin:'0 0 16px 0', color:'#333', fontSize:'18px'}}>Vegetables ({vegetables.length})</h3>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr style={{background:'#e8f5e8'}}>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Name</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Description</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Price</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'left'}}>Quantity</th>
                          <th style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(vegetables) ? vegetables : []).map(p=>(
                          <tr key={p.id}>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.name}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.description}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>Rs. {p.price}</td>
                            <td style={{padding:8, border:'1px solid #ddd'}}>{p.quantity}</td>
                            <td style={{padding:8, border:'1px solid #ddd', textAlign:'center'}}>
                              <button onClick={()=>{
                                setForm({name:p.name,description:p.description,price:p.price,quantity:p.quantity,category:'vegetables',image:p.image||''});
                                setImagePreview(p.image || '');
                                setImageFile(null);
                                setEditingProductId(p.id);
                              }} style={{marginRight:8, padding:'4px 8px', fontSize:'12px'}}>Edit</button>
                              <button onClick={()=>managerDeleteProduct(p.id)} style={{padding:'4px 8px', fontSize:'12px', background:'#dc3545', color:'white', border:'none', borderRadius:'4px'}}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empty State */}
                {products.length === 0 && bakery.length === 0 && fruits.length === 0 && dairy.length === 0 && meat.length === 0 && beverages.length === 0 && grains.length === 0 && vegetables.length === 0 && (
                  <div style={{border:'1px solid #ccc', borderRadius:8, padding:40, background:'#f8f9fa', textAlign:'center'}}>
                    <h4 style={{color:'#666', margin:0}}>No products found</h4>
                    <p style={{color:'#888', margin:'8px 0 0 0'}}>Start by creating products in different categories using the form above.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {showUserCrud && (
            <div style={{display:'flex', flexDirection:'column', gap:24, maxWidth:800, margin:'0 auto'}}>
              <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                <h3 style={{marginTop:0}}>All Users</h3>
                {userError && <div style={{color:'red',marginBottom:8}}>{userError}</div>}
                {loadingUsers ? <div>Loading users...</div> : (
                  <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{background:'#eee'}}>
                        <th style={{padding:8, border:'1px solid #ddd'}}>ID</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Username</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Email</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Password</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Role</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Phone</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Address</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(users) ? users : []).map(u => (
                        <tr key={u.id}>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{u.id}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{u.username}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{u.email}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{u.password}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{u.role}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{u.phone}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{u.address}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>
                            <button onClick={()=>{viewUser(u.id);}}>View</button>
                            <button style={{marginLeft:8}} onClick={()=>{setUserForm(u); setEditingUserId(u.id);}}>Edit</button>
                            <button style={{marginLeft:8}} onClick={()=>deleteUser(u.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Edit User Section */}
              {editingUserId && (
                <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#f9f9f9'}}>
                  <h3 style={{marginTop:0}}>Edit User</h3>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <input placeholder="Username" value={userForm.username||''} onChange={e=>setUserForm({...userForm,username:e.target.value})}/>
                    <input placeholder="Email" value={userForm.email||''} onChange={e=>setUserForm({...userForm,email:e.target.value})}/>
                    <input placeholder="Password" value={userForm.password||''} onChange={e=>setUserForm({...userForm,password:e.target.value})}/>
                    <input placeholder="Role" value={userForm.role||''} onChange={e=>setUserForm({...userForm,role:e.target.value})}/>
                    <input placeholder="Phone" value={userForm.phone||''} onChange={e=>setUserForm({...userForm,phone:e.target.value})}/>
                    <input placeholder="Address" value={userForm.address||''} onChange={e=>setUserForm({...userForm,address:e.target.value})}/>
                  </div>
                  <div style={{marginTop:16, display:'flex', gap:12}}>
                    <button onClick={updateUser}>Update User</button>
                    <button onClick={()=>{setEditingUserId(null); setUserForm({});}}>Cancel</button>
                  </div>
                </div>
              )}
              {/* View User Section */}
              {viewedUser && (
                <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#f1f8e9'}}>
                  <h3 style={{marginTop:0}}>User Details</h3>
                  <div><b>ID:</b> {viewedUser.id}</div>
                  <div><b>Username:</b> {viewedUser.username}</div>
                  <div><b>Email:</b> {viewedUser.email}</div>
                  <div><b>Password:</b> {viewedUser.password}</div>
                  <div><b>Role:</b> {viewedUser.role}</div>
                  <div><b>Phone:</b> {viewedUser.phone}</div>
                  <div><b>Address:</b> {viewedUser.address}</div>
                  <button style={{marginTop:12}} onClick={()=>setViewedUser(null)}>Close</button>
                </div>
              )}
            </div>
          )}
          {showEmployeeCrud && (
            <div style={{display:'flex', flexDirection:'column', gap:24, maxWidth:800, margin:'0 auto'}}>
              {/* Add Employee Section - always visible above table */}
              {!editingEmployeeId && (
                <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#f9f9f9'}}>
                  <h3 style={{marginTop:0}}>Add Employee</h3>
                  <div style={{
                    padding:'8px 12px',
                    backgroundColor:'#e3f2fd',
                    borderRadius:'4px',
                    fontSize:'14px',
                    color:'#1976d2',
                    marginBottom:'12px',
                    border:'1px solid #bbdefb'
                  }}>
                    💡 <strong>Note:</strong> Email and password fields are for future employee login functionality. 
                    If the backend doesn't support them yet, the employee will be created without login credentials.
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <input placeholder="Name" value={employeeForm.name} onChange={e=>setEmployeeForm({...employeeForm,name:e.target.value})}/>
                    <input placeholder="Address" value={employeeForm.address} onChange={e=>setEmployeeForm({...employeeForm,address:e.target.value})}/>
                    <input placeholder="Phone" value={employeeForm.phone} onChange={e=>setEmployeeForm({...employeeForm,phone:e.target.value})}/>
                    <input placeholder="Birthdate (yyyy-MM-dd)" value={employeeForm.birthdate} onChange={e=>setEmployeeForm({...employeeForm,birthdate:e.target.value})}/>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={employeeForm.email} 
                      onChange={e=>setEmployeeForm({...employeeForm,email:e.target.value})}
                      style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={employeeForm.password} 
                      onChange={e=>setEmployeeForm({...employeeForm,password:e.target.value})}
                      style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                    />
                    <select 
                      value={employeeForm.role} 
                      onChange={e=>setEmployeeForm({...employeeForm,role:e.target.value})}
                      style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px', backgroundColor:'#fff', gridColumn:'span 2'}}
                    >
                      <option value="">Select Role</option>
                      <option value="Delivery">🚚 Delivery</option>
                      <option value="Worker">👷 Worker</option>
                      <option value="Payment Handler">💰 Payment Handler</option>
                    </select>
                  </div>
                  <div style={{marginTop:16, display:'flex', gap:12}}>
                    <button onClick={addEmployee}>Add Employee</button>
                    <button onClick={()=>setEmployeeForm({name:'',address:'',phone:'',birthdate:'',role:'',email:'',password:''})}>Clear</button>
                  </div>
                </div>
              )}
              {/* Edit Employee Section - only visible when editing */}
              {editingEmployeeId && (
                <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#f9f9f9', marginTop:0}}>
                  <h3 style={{marginTop:0}}>Edit Employee</h3>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <input placeholder="Name" value={employeeForm.name} onChange={e=>setEmployeeForm({...employeeForm,name:e.target.value})}/>
                    <input placeholder="Address" value={employeeForm.address} onChange={e=>setEmployeeForm({...employeeForm,address:e.target.value})}/>
                    <input placeholder="Phone" value={employeeForm.phone} onChange={e=>setEmployeeForm({...employeeForm,phone:e.target.value})}/>
                    <input placeholder="Birthdate (yyyy-MM-dd)" value={employeeForm.birthdate} onChange={e=>setEmployeeForm({...employeeForm,birthdate:e.target.value})}/>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={employeeForm.email} 
                      onChange={e=>setEmployeeForm({...employeeForm,email:e.target.value})}
                      style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                    />
                    <input 
                      type="password" 
                      placeholder="New Password (leave blank to keep current)" 
                      value={employeeForm.password} 
                      onChange={e=>setEmployeeForm({...employeeForm,password:e.target.value})}
                      style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                    />
                    <select 
                      value={employeeForm.role} 
                      onChange={e=>setEmployeeForm({...employeeForm,role:e.target.value})}
                      style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px', backgroundColor:'#fff', gridColumn:'span 2'}}
                    >
                      <option value="">Select Role</option>
                      <option value="Delivery">🚚 Delivery</option>
                      <option value="Worker">👷 Worker</option>
                      <option value="Payment Handler">💰 Payment Handler</option>
                    </select>
                  </div>
                  <div style={{marginTop:16, display:'flex', gap:12}}>
                    <button onClick={updateEmployee} style={{background:'#1976d2',color:'#fff',padding:'8px 16px',border:'none',borderRadius:4}}>Save Edit</button>
                    <button onClick={()=>{setEditingEmployeeId(null); setEmployeeForm({name:'',address:'',phone:'',birthdate:'',role:'',email:'',password:''});}}>Cancel</button>
                  </div>
                </div>
              )}
              {/* Employee Table Section */}
              <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                  <h3 style={{margin:0}}>All Employees ({employees.length})</h3>
                  <button 
                    onClick={() => {
                      console.log('Manual refresh clicked');
                      fetchEmployees();
                    }}
                    style={{
                      padding:'8px 16px',
                      backgroundColor:'#2196f3',
                      color:'white',
                      border:'none',
                      borderRadius:'4px',
                      cursor:'pointer',
                      fontSize:'14px'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
                {employeeError && <div style={{color:'red',marginBottom:8}}>{employeeError}</div>}
                
                {/* Debug info */}
                <div style={{
                  fontSize:'12px',
                  color:'#666',
                  marginBottom:'10px',
                  padding:'8px',
                  backgroundColor:'#f5f5f5',
                  borderRadius:'4px'
                }}>
                  Debug: {employees.length} employees loaded. Loading: {loadingEmployees.toString()}
                  {employees.length > 0 && ` (Latest: ${employees[employees.length-1]?.name})`}
                </div>
                
                {loadingEmployees ? <div>Loading employees...</div> : 
                  employees.length === 0 ? (
                    <div style={{
                      textAlign:'center',
                      padding:'40px',
                      color:'#666',
                      backgroundColor:'#f9f9f9',
                      borderRadius:'8px',
                      border:'2px dashed #ddd'
                    }}>
                      <div style={{fontSize:'48px', marginBottom:'16px'}}>👥</div>
                      <div style={{fontSize:'18px', fontWeight:'600', marginBottom:'8px'}}>No Employees Found</div>
                      <div style={{fontSize:'14px'}}>
                        {employeeError ? 'There was an error loading employees.' : 'Add your first employee using the form above.'}
                      </div>
                    </div>
                  ) : (
                  <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{background:'#eee'}}>
                        <th style={{padding:8, border:'1px solid #ddd'}}>ID</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Name</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Address</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Phone</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Email</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Birthdate</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Role</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(employees) ? employees : []).map(emp => (
                        <tr key={emp.id}>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{emp.id}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{emp.name}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{emp.address}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{emp.phoneNumber || emp.phone || ''}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{emp.email || 'N/A'}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{emp.birthdate}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{emp.role}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>
                            <button onClick={()=>{
                              setEmployeeForm({
                                name: emp.name,
                                address: emp.address,
                                phone: emp.phoneNumber || emp.phone || '',
                                birthdate: emp.birthdate,
                                role: emp.role,
                                email: emp.email || '',
                                password: '' // Don't populate password for security
                              });
                              setEditingEmployeeId(emp.id);
                            }}>Edit</button>
                            <button style={{marginLeft:8}} onClick={()=>deleteEmployee(emp.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )
                }
              </div>
              
              {/* Delivery Dashboard Section */}
              <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#f8fff9', marginTop:24}}>
                <h3 style={{marginTop:0, color:'#2e7d32', display:'flex', alignItems:'center', gap:'8px'}}>
                  🚚 Delivery Employee Dashboard
                </h3>
                <p style={{color:'#666', marginBottom:'20px'}}>
                  Monitor delivery employees and their assignment status for order fulfillment.
                </p>
                
                {(() => {
                  const deliveryEmployees = employees.filter(emp => emp.role && emp.role.toLowerCase() === 'delivery');
                  return (
                    <div>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                        <h4 style={{margin:0, color:'#333'}}>
                          Available Delivery Staff ({deliveryEmployees.length})
                        </h4>
                        {deliveryEmployees.length === 0 && (
                          <span style={{
                            padding:'4px 12px',
                            backgroundColor:'#ffebee',
                            color:'#c62828',
                            borderRadius:'12px',
                            fontSize:'12px',
                            fontWeight:'600'
                          }}>
                            ⚠️ NO DELIVERY STAFF
                          </span>
                        )}
                      </div>
                      
                      {deliveryEmployees.length > 0 ? (
                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'16px'}}>
                          {(Array.isArray(deliveryEmployees) ? deliveryEmployees : []).map(emp => (
                            <div key={emp.id} style={{
                              border:'1px solid #c8e6c9',
                              borderRadius:'8px',
                              padding:'16px',
                              backgroundColor:'#e8f5e9',
                              position:'relative'
                            }}>
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div>
                                  <h5 style={{margin:'0 0 8px 0', color:'#2e7d32', fontSize:'16px'}}>{emp.name}</h5>
                                  <p style={{margin:'4px 0', color:'#666', fontSize:'14px'}}>ID: {emp.id}</p>
                                  <p style={{margin:'4px 0', color:'#666', fontSize:'14px'}}>Role: {emp.role}</p>
                                </div>
                                <span style={{
                                  padding:'4px 8px',
                                  backgroundColor:'#d4edda',
                                  color:'#155724',
                                  borderRadius:'12px',
                                  fontSize:'11px',
                                  fontWeight:'600'
                                }}>
                                  ACTIVE
                                </span>
                              </div>
                              
                              <div style={{marginTop:'12px', padding:'8px', backgroundColor:'#fff', borderRadius:'4px', fontSize:'12px'}}>
                                <div style={{color:'#666'}}>📧 Contact: {emp.phoneNumber || emp.phone || 'Not provided'}</div>
                                <div style={{color:'#666', marginTop:'4px'}}>📍 Address: {emp.address || 'Not provided'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          textAlign:'center',
                          padding:'40px',
                          backgroundColor:'#fff3cd',
                          borderRadius:'8px',
                          border:'1px solid #ffeaa7'
                        }}>
                          <div style={{fontSize:'48px', marginBottom:'16px'}}>⚠️</div>
                          <h4 style={{color:'#856404', margin:'0 0 8px 0'}}>No Delivery Employees Found</h4>
                          <p style={{color:'#856404', margin:'0', fontSize:'14px'}}>
                            Orders cannot be automatically assigned without delivery employees. 
                            Please add employees with "delivery" role to enable order processing.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          {showOrderCrud && (
            <div style={{display:'flex', flexDirection:'column', gap:24, maxWidth:900, margin:'0 auto'}}>
              <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#fff'}}>
                <h3 style={{marginTop:0}}>All Orders</h3>
                {orderError && <div style={{color:'red',marginBottom:8}}>{orderError}</div>}
                {loadingOrders ? <div>Loading orders...</div> : (
                  <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{background:'#eee'}}>
                        <th style={{padding:8, border:'1px solid #ddd'}}>ID</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Customer</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Total</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Status</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Delivery Address</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Delivery Employee</th>
                        <th style={{padding:8, border:'1px solid #ddd'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(orders) ? orders : []).map(order => (
                        <tr key={order.id}>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{order.id}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{order.customerId ?? order.customer_id ?? ''}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{order.total ?? (order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : '')}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{order.status}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>{order.deliveryAddress || order.delivery_address || ''}</td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>
                            {(() => {
                              // Check multiple possible field names for delivery employee
                              const deliveryEmployee = order.assignedDeliveryEmployeeName || 
                                                      order.assigned_delivery_employee_name ||
                                                      order.deliveryEmployeeName ||
                                                      order.delivery_employee_name ||
                                                      order.deliveryEmployee ||
                                                      order.delivery_employee;
                              
                              return (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  backgroundColor: deliveryEmployee ? '#d4edda' : '#f8d7da',
                                  color: deliveryEmployee ? '#155724' : '#721c24'
                                }}>
                                  {deliveryEmployee ? '🚚' : '⚠️'} 
                                  {deliveryEmployee || 'Not Assigned'}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{padding:8, border:'1px solid #ddd'}}>
                            <button onClick={()=>{
                              setOrderForm({status:order.status,deliveryAddress:order.deliveryAddress || order.delivery_address || ''});
                              setEditingOrderId(order.id);
                            }}>Edit</button>
                            <button style={{marginLeft:8}} onClick={()=>deleteOrder(order.id)}>Delete</button>
                            <button style={{marginLeft:8}} onClick={()=>viewOrder(order.id)}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Edit Order Section */}
              {editingOrderId && (
                <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#f9f9f9', marginTop:0}}>
                  <h3 style={{marginTop:0}}>Edit Order</h3>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <select value={orderForm.status} onChange={e=>setOrderForm({...orderForm,status:e.target.value})}>
                      <option value="">Select Status</option>
                      <option value="PLACED">PLACED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="RETURNED">RETURNED</option>
                    </select>
                    <input placeholder="Delivery Address" value={orderForm.deliveryAddress} onChange={e=>setOrderForm({...orderForm,deliveryAddress:e.target.value})}/>
                  </div>
                  <div style={{marginTop:16, display:'flex', gap:12}}>
                    <button onClick={updateOrder} style={{background:'#7b1fa2',color:'#fff',padding:'8px 16px',border:'none',borderRadius:4}}>Save Edit</button>
                    <button onClick={()=>{setEditingOrderId(null); setOrderForm({status:'',deliveryAddress:''});}}>Cancel</button>
                  </div>
                </div>
              )}
              {/* View Order Section */}
              {viewedOrder && (
                <div style={{border:'1px solid #ccc', borderRadius:8, padding:20, background:'#e3f2fd'}}>
                  <h3 style={{marginTop:0}}>Order Details</h3>
                  <div><b>ID:</b> {viewedOrder.id}</div>
                  <div><b>Customer:</b> {viewedOrder.customerId ?? viewedOrder.customer_id ?? ''}</div>
                  <div><b>Total:</b> {viewedOrder.total ?? (viewedOrder.items ? viewedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : '')}</div>
                  <div><b>Status:</b> 
                    <span style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: viewedOrder.status === 'delivered' ? '#d4edda' : viewedOrder.status === 'pending' ? '#fff3cd' : '#d1ecf1',
                      color: viewedOrder.status === 'delivered' ? '#155724' : viewedOrder.status === 'pending' ? '#856404' : '#0c5460'
                    }}>
                      {viewedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <div><b>Delivery Address:</b> {viewedOrder.deliveryAddress || viewedOrder.delivery_address || ''}</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <b>Assigned Delivery Employee:</b> 
                    {(() => {
                      // Check multiple possible field names for delivery employee
                      const deliveryEmployee = viewedOrder.assignedDeliveryEmployeeName || 
                                              viewedOrder.assigned_delivery_employee_name ||
                                              viewedOrder.deliveryEmployeeName ||
                                              viewedOrder.delivery_employee_name ||
                                              viewedOrder.deliveryEmployee ||
                                              viewedOrder.delivery_employee;
                      
                      return (
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: deliveryEmployee ? '#e8f5e9' : '#ffebee',
                          color: deliveryEmployee ? '#2e7d32' : '#c62828',
                          border: `1px solid ${deliveryEmployee ? '#c8e6c9' : '#ffcdd2'}`
                        }}>
                          {deliveryEmployee ? '🚚 ' + deliveryEmployee : '⚠️ Not Assigned'}
                        </span>
                      );
                    })()}
                  </div>
                  <div><b>Items:</b> <pre>{JSON.stringify(viewedOrder.items, null, 2)}</pre></div>
                  <button style={{marginTop:12}} onClick={()=>setViewedOrder(null)}>Close</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

        {page==='home' && <HomePage 
          addToCart={addToCart} 
          cart={cart} 
          onNavigate={setPage} 
          user={user}
          onCategoryClick={(category) => {
            setSelectedCategory(category);
            setPage('products');
          }}
        />}

        {/* TEMPORARY DEBUG BUTTON */}
        {page === 'home' && (
          <div style={{position:'fixed', top:'10px', right:'10px', zIndex:9999}}>
            <button 
              onClick={() => setPage('products')} 
              style={{
                backgroundColor:'#ff0000', 
                color:'white', 
                padding:'10px', 
                border:'none', 
                borderRadius:'5px',
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              DEBUG: Go to Products
            </button>
          </div>
        )}

        {page==='account' && user && (
    <div style={{fontFamily:'Nunito, Open Sans, Arial',padding:0,margin:0,minHeight:'100vh',background:'url("/FoodMart-1.0.0/images/bg-leaves-img-pattern.png") repeat, linear-gradient(135deg,#f8fafc 0%,#e3f2fd 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:20,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',padding:48,minWidth:340,maxWidth:400,width:'100%',border:'1px solid #eee',position:'relative'}}>
        <img src="/FoodMart-1.0.0/images/logo.png" alt="Shanthi Stores Logo" style={{width:80,display:'block',margin:'0 auto 18px'}}/>
        <h1 style={{textAlign:'center',color:'#7b1fa2',marginBottom:24,fontWeight:700,letterSpacing:1,fontFamily:'Nunito'}}>My Account</h1>
        <div style={{marginBottom:18}}>
          <div><b>Username:</b> {user.username}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Role:</b> {user.role}</div>
          <div><b>Phone:</b> {user.phone}</div>
          <div><b>Address:</b> {user.address}</div>
        </div>
        <button onClick={signOut} style={{padding:'12px 32px',fontSize:18,borderRadius:8,background:'#d32f2f',color:'#fff',border:'none',fontWeight:700,display:'block',margin:'0 auto'}}>Sign Out</button>
      </div>
    </div>
  )}

        {/* Favourites Page */}
        {page==='favourites' && (
          <div style={{
            fontFamily:'Nunito, Open Sans, Arial',
            padding:'40px 24px',
            margin:0,
            minHeight:'70vh',
            background:'linear-gradient(135deg,#f8fafc 0%,#e3f2fd 100%)'
          }}>
            <div style={{
              maxWidth:'1200px',
              margin:'0 auto',
              background:'#fff',
              borderRadius:'12px',
              padding:'40px',
              boxShadow:'0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h1 style={{
                textAlign:'center',
                color:'#f9a825',
                marginBottom:'30px',
                fontWeight:'700',
                fontSize:'32px'
              }}>
                Your Favourites
              </h1>
              {favourites.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px'}}>
                  <div style={{
                    width:'100px',
                    height:'100px',
                    backgroundColor:'#f0f0f0',
                    borderRadius:'8px',
                    margin:'0 auto 12px',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color:'#999',
                    fontSize:'32px'
                  }}>
                    ❤️
                  </div>
                  <h3 style={{margin:'8px 0',color:'#333'}}>No favourites yet</h3>
                  <p style={{color:'#666',fontSize:'14px'}}>
                    Start adding items to your favourites by clicking the heart icon on products!
                  </p>
                  <button 
                    onClick={() => setPage('products')}
                    style={{
                      marginTop:'12px',
                      padding:'8px 16px',
                      backgroundColor:'#f9a825',
                      color:'#fff',
                      border:'none',
                      borderRadius:'6px',
                      cursor:'pointer',
                      fontWeight:'500'
                    }}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div style={{
                  display:'grid',
                  gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',
                  gap:'20px',
                  marginTop:'30px'
                }}>
                  {(Array.isArray(favourites) ? favourites : []).map((product, i) => {
                    const pid = product.id || i;
                    const qty = qtys[pid] || 1;
                    // Create unique key using category and id to avoid duplicate keys
                    const uniqueKey = `fav-${product.category || 'product'}-${product.id || i}`;
                    return (
                      <div key={uniqueKey} style={{background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',padding:'16px',position:'relative',minHeight:'300px',display:'flex',flexDirection:'column',border:'1px solid #f0f0f0'}}>
                        {/* Remove from favourites button */}
                        <div 
                          style={{
                            position:'absolute',
                            top:'12px',
                            right:'12px',
                            width:'32px',
                            height:'32px',
                            background:'#fff',
                            borderRadius:'50%',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            cursor:'pointer',
                            boxShadow:'0 2px 4px rgba(0,0,0,0.1)',
                            zIndex:2
                          }}
                          onClick={() => toggleFavourite(product)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4757" stroke="#ff4757" strokeWidth="2">
                            <path d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                        
                        {/* Product image */}
                        <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'140px',marginBottom:'12px',borderRadius:'8px',backgroundColor:'#fafafa'}}>
                          <img 
                            src={(() => {
                              // If product has an image property, use it
                              if (product.image) return product.image;
                              
                              // Otherwise, intelligently match based on product name/category
                              const name = (product.name || '').toLowerCase();
                              const category = (product.category || '').toLowerCase();
                              
                              // Bakery items
                              if (category === 'bakery' || name.includes('bread') || name.includes('baguette') || name.includes('biscuit')) {
                                return '/FoodMart-1.0.0/images/icon-bread-baguette.png';
                              }
                              
                              // Fruits
                              if (category === 'fruits' || name.includes('banana')) return '/FoodMart-1.0.0/images/thumb-bananas.png';
                              if (name.includes('avocado')) return '/FoodMart-1.0.0/images/thumb-avocado.png';
                              if (name.includes('raspberr') || name.includes('berr')) return '/FoodMart-1.0.0/images/thumb-raspberries.png';
                              
                              // Dairy
                              if (category === 'dairy' || name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) {
                                return '/FoodMart-1.0.0/images/thumb-milk.png';
                              }
                              
                              // Meat
                              if (category === 'meat' || name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('meat')) {
                                return '/FoodMart-1.0.0/images/icon-animal-products-drumsticks.png';
                              }
                              if (name.includes('tuna') || name.includes('fish')) return '/FoodMart-1.0.0/images/thumb-tuna.jpg';
                              
                              // Beverages
                              if (category === 'beverages' || name.includes('juice')) return '/FoodMart-1.0.0/images/thumb-orange-juice.png';
                              if (name.includes('wine') || name.includes('drink') || name.includes('soda')) return '/FoodMart-1.0.0/images/icon-wine-glass-bottle.png';
                              
                              // Vegetables
                              if (name.includes('tomato') && name.includes('ketchup')) return '/FoodMart-1.0.0/images/thumb-tomatoketchup.png';
                              if (name.includes('tomato')) return '/FoodMart-1.0.0/images/thumb-tomatoes.png';
                              if (name.includes('cucumber')) return '/FoodMart-1.0.0/images/thumb-cucumber.png';
                              if (category === 'vegetables' || name.includes('vegetable') || name.includes('broccoli')) {
                                return '/FoodMart-1.0.0/images/icon-vegetables-broccoli.png';
                              }
                              
                              // Grains
                              if (category === 'grains' || name.includes('rice') || name.includes('grain') || name.includes('cereal')) {
                                return '/FoodMart-1.0.0/images/icon-bread-herb-flour.png';
                              }
                              
                              // General products / fallback
                              return '/FoodMart-1.0.0/images/product-thumb-1.png';
                            })()}
                            alt={product.name || 'Product'} 
                            style={{maxHeight:'120px',maxWidth:'100%',objectFit:'contain'}}
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.target.src = '/FoodMart-1.0.0/images/product-thumb-1.png';
                            }}
                          />
                        </div>
                        
                        {/* Product info */}
                        <div style={{flex:1,display:'flex',flexDirection:'column'}}>
                          <h3 style={{fontSize:'16px',fontWeight:'600',margin:'0 0 8px',color:'#333',lineHeight:'1.3'}}>{product.name}</h3>
                          <p style={{fontSize:'14px',color:'#666',margin:'0 0 12px',flex:1}}>{product.description}</p>
                          <div style={{fontSize:'18px',fontWeight:'700',color:'#f9a825',marginBottom:'12px'}}>Rs. {product.price}</div>
                          
                          {/* Add to cart button */}
                          <button 
                            onClick={() => addToCart(product)}
                            style={{
                              width:'100%',
                              padding:'10px',
                              backgroundColor:'#f9a825',
                              color:'#fff',
                              border:'none',
                              borderRadius:'6px',
                              fontWeight:'600',
                              cursor:'pointer',
                              transition:'background-color 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#f57f17'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#f9a825'}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Orders Page */}
        {page==='orders' && (
          <div style={{
            fontFamily:'Nunito, Open Sans, Arial',
            padding:'40px 24px',
            margin:0,
            minHeight:'70vh',
            background:'linear-gradient(135deg,#f8fafc 0%,#e3f2fd 100%)'
          }}>
            <div style={{
              maxWidth:'1200px',
              margin:'0 auto',
              background:'#fff',
              borderRadius:'12px',
              padding:'40px',
              boxShadow:'0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h1 style={{
                textAlign:'center',
                color:'#f9a825',
                marginBottom:'30px',
                fontWeight:'700',
                fontSize:'32px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                gap:'12px'
              }}>
                🛍️ My Orders
              </h1>
              
              <button 
                onClick={() => { fetchUserOrders(); }}
                style={{
                  padding:'12px 24px',
                  backgroundColor:'#f9a825',
                  color:'#fff',
                  border:'none',
                  borderRadius:'8px',
                  cursor:'pointer',
                  fontWeight:'600',
                  marginBottom:'20px'
                }}
              >
                Refresh Orders
              </button>

              {loadingUserOrders ? (
                <div style={{textAlign:'center',padding:'40px'}}>
                  <div style={{color:'#666',fontSize:'16px'}}>Loading your orders...</div>
                </div>
              ) : userOrderError ? (
                <div style={{
                  textAlign:'center',
                  padding:'40px',
                  backgroundColor:'#ffebee',
                  borderRadius:'8px',
                  color:'#c62828'
                }}>
                  <div style={{fontSize:'18px',marginBottom:'8px'}}>⚠️ Error</div>
                  <div>{userOrderError}</div>
                </div>
              ) : !Array.isArray(userOrders) || userOrders.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px'}}>
                  <div style={{
                    width:'100px',
                    height:'100px',
                    backgroundColor:'#f0f0f0',
                    borderRadius:'8px',
                    margin:'0 auto 12px',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color:'#999',
                    fontSize:'32px'
                  }}>
                    📦
                  </div>
                  <h3 style={{margin:'8px 0',color:'#333'}}>No orders found</h3>
                  <p style={{color:'#666',fontSize:'14px'}}>
                    You haven't placed any orders yet. Start shopping to see your orders here!
                  </p>
                  <button 
                    onClick={() => setPage('products')}
                    style={{
                      marginTop:'12px',
                      padding:'8px 16px',
                      backgroundColor:'#f9a825',
                      color:'#fff',
                      border:'none',
                      borderRadius:'6px',
                      cursor:'pointer',
                      fontWeight:'500'
                    }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{marginBottom:'20px',color:'#666',fontSize:'14px'}}>
                    Total Orders: {Array.isArray(userOrders) ? userOrders.length : 0}
                  </div>
                  
                  <div style={{
                    display:'grid',
                    gap:'16px'
                  }}>
                    {(Array.isArray(userOrders) ? userOrders : []).map((order) => (
                      <div key={order.id} style={{
                        border:'1px solid #e0e0e0',
                        borderRadius:'12px',
                        padding:'20px',
                        backgroundColor:'#fafafa'
                      }}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                          <div>
                            <h3 style={{margin:'0 0 8px 0',color:'#333',fontSize:'18px'}}>
                              Order #{order.id}
                            </h3>
                            <div style={{color:'#666',fontSize:'14px'}}>
                              Placed: {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Date not available'}
                            </div>
                          </div>
                          
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <span style={{
                              padding:'6px 12px',
                              borderRadius:'16px',
                              fontSize:'12px',
                              fontWeight:'600',
                              backgroundColor: order.status === 'delivered' ? '#d4edda' : 
                                              order.status === 'pending' ? '#fff3cd' : 
                                              order.status === 'processing' ? '#cce7ff' : '#f8d7da',
                              color: order.status === 'delivered' ? '#155724' : 
                                     order.status === 'pending' ? '#856404' : 
                                     order.status === 'processing' ? '#004085' : '#721c24'
                            }}>
                              {(order.status || 'unknown').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{marginBottom:'12px'}}>
                          <div style={{color:'#666',fontSize:'14px',marginBottom:'4px'}}>
                            <b>Total:</b> Rs. {order.total || 'Not available'}
                          </div>
                          <div style={{color:'#666',fontSize:'14px',marginBottom:'4px'}}>
                            <b>Delivery Address:</b> {order.deliveryAddress || order.delivery_address || 'Not provided'}
                          </div>
                          
                          {(() => {
                            const deliveryEmployee = order.assignedDeliveryEmployeeName || 
                                                    order.assigned_delivery_employee_name ||
                                                    order.deliveryEmployeeName ||
                                                    order.delivery_employee_name ||
                                                    order.deliveryEmployee ||
                                                    order.delivery_employee;
                            
                            return (
                              <div style={{color:'#666',fontSize:'14px',marginBottom:'8px'}}>
                                <b>Delivery Employee:</b> 
                                <span style={{
                                  marginLeft:'8px',
                                  padding:'2px 8px',
                                  borderRadius:'12px',
                                  fontSize:'11px',
                                  fontWeight:'500',
                                  backgroundColor: deliveryEmployee ? '#e8f5e9' : '#ffebee',
                                  color: deliveryEmployee ? '#2e7d32' : '#c62828'
                                }}>
                                  {deliveryEmployee ? '🚚 ' + deliveryEmployee : '⚠️ Not Assigned'}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <button 
                          onClick={() => viewUserOrder(order.id)}
                          style={{
                            padding:'8px 16px',
                            backgroundColor:'#1976d2',
                            color:'#fff',
                            border:'none',
                            borderRadius:'6px',
                            cursor:'pointer',
                            fontSize:'14px',
                            fontWeight:'500'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Order Details Modal */}
              {viewedUserOrder && (
                <div style={{
                  position:'fixed',
                  top:0,
                  left:0,
                  width:'100%',
                  height:'100%',
                  backgroundColor:'rgba(0,0,0,0.5)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  zIndex:10000
                }}>
                  <div style={{
                    backgroundColor:'#fff',
                    padding:'30px',
                    borderRadius:'12px',
                    maxWidth:'600px',
                    width:'90%',
                    maxHeight:'80vh',
                    overflow:'auto',
                    boxShadow:'0 8px 32px rgba(0,0,0,0.2)'
                  }}>
                    <h2 style={{margin:'0 0 20px 0',color:'#333',fontSize:'24px'}}>
                      Order Details - #{viewedUserOrder.id}
                    </h2>
                    
                    <div style={{marginBottom:'20px'}}>
                      <div style={{
                        display:'grid',
                        gridTemplateColumns:'1fr 1fr',
                        gap:'16px',
                        marginBottom:'16px'
                      }}>
                        <div style={{
                          padding:'12px',
                          backgroundColor:'#f8f9fa',
                          borderRadius:'8px',
                          border:'1px solid #e9ecef'
                        }}>
                          <div style={{fontSize:'12px',color:'#666',marginBottom:'4px',fontWeight:'600'}}>
                            ORDER DATE
                          </div>
                          <div style={{fontSize:'14px',color:'#333'}}>
                            {viewedUserOrder.created_at ? new Date(viewedUserOrder.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Not available'}
                          </div>
                        </div>
                        
                        <div style={{
                          padding:'12px',
                          backgroundColor:'#f8f9fa',
                          borderRadius:'8px',
                          border:'1px solid #e9ecef'
                        }}>
                          <div style={{fontSize:'12px',color:'#666',marginBottom:'4px',fontWeight:'600'}}>
                            TOTAL AMOUNT
                          </div>
                          <div style={{fontSize:'18px',color:'#f9a825',fontWeight:'700'}}>
                            Rs. {viewedUserOrder.total || '0.00'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        padding:'12px',
                        backgroundColor:'#f8f9fa',
                        borderRadius:'8px',
                        border:'1px solid #e9ecef',
                        marginBottom:'16px'
                      }}>
                        <div style={{fontSize:'12px',color:'#666',marginBottom:'4px',fontWeight:'600'}}>
                          ORDER STATUS
                        </div>
                        <span style={{
                          display:'inline-block',
                          padding:'6px 12px',
                          borderRadius:'16px',
                          fontSize:'12px',
                          fontWeight:'600',
                          backgroundColor: viewedUserOrder.status === 'delivered' ? '#d4edda' : 
                                          viewedUserOrder.status === 'pending' ? '#fff3cd' : 
                                          viewedUserOrder.status === 'processing' ? '#cce7ff' : '#f8d7da',
                          color: viewedUserOrder.status === 'delivered' ? '#155724' : 
                                 viewedUserOrder.status === 'pending' ? '#856404' : 
                                 viewedUserOrder.status === 'processing' ? '#004085' : '#721c24'
                        }}>
                          {(viewedUserOrder.status || 'unknown').toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{
                        padding:'12px',
                        backgroundColor:'#f8f9fa',
                        borderRadius:'8px',
                        border:'1px solid #e9ecef',
                        marginBottom:'16px'
                      }}>
                        <div style={{fontSize:'12px',color:'#666',marginBottom:'4px',fontWeight:'600'}}>
                          DELIVERY ADDRESS
                        </div>
                        <div style={{fontSize:'14px',color:'#333'}}>
                          {viewedUserOrder.deliveryAddress || viewedUserOrder.delivery_address || 'Not provided'}
                        </div>
                      </div>
                      
                      {(() => {
                        const deliveryEmployee = viewedUserOrder.assignedDeliveryEmployeeName || 
                                                viewedUserOrder.assigned_delivery_employee_name ||
                                                viewedUserOrder.deliveryEmployeeName ||
                                                viewedUserOrder.delivery_employee_name ||
                                                viewedUserOrder.deliveryEmployee ||
                                                viewedUserOrder.delivery_employee;
                        
                        return (
                          <div style={{color:'#666',fontSize:'14px',marginBottom:'16px'}}>
                            <b>Delivery Employee:</b> 
                            <div style={{
                              marginTop:'4px',
                              padding:'8px 12px',
                              borderRadius:'8px',
                              backgroundColor: deliveryEmployee ? '#e8f5e9' : '#ffebee',
                              color: deliveryEmployee ? '#2e7d32' : '#c62828',
                              border: `1px solid ${deliveryEmployee ? '#c8e6c9' : '#ffcdd2'}`
                            }}>
                              {deliveryEmployee ? '🚚 ' + deliveryEmployee : '⚠️ Not Assigned Yet'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div style={{marginBottom:'20px'}}>
                      <b style={{color:'#333',fontSize:'16px',marginBottom:'12px',display:'block'}}>Items Ordered:</b>
                      

                      
                      <div style={{
                        marginTop:'8px',
                        backgroundColor:'#f8f9fa',
                        borderRadius:'8px',
                        border:'1px solid #e9ecef',
                        overflow:'hidden'
                      }}>
                        {(() => {
                          try {
                            const items = typeof viewedUserOrder.items === 'string' 
                              ? JSON.parse(viewedUserOrder.items) 
                              : viewedUserOrder.items || [];
                            

                            
                            if (Array.isArray(items) && items.length > 0) {
                              return (
                                <div>
                                  {(Array.isArray(items) ? items : []).map((item, index) => {
                                    // Extract product information from the nested structure
                                    const productName = item.product?.name || 
                                                       item.name || 
                                                       item.productName || 
                                                       item.title || 
                                                       item.product_name ||
                                                       item.itemName ||
                                                       item.item_name ||
                                                       `Product ${index + 1}`;
                                    
                                    const productPrice = item.product?.price || item.price || 0;
                                    const productDescription = item.product?.description || item.description || '';
                                    const itemQuantity = item.quantity || item.cartQty || 1;
                                    
                                    return (
                                      <div key={index} style={{
                                        padding:'12px 16px',
                                        borderBottom: index < items.length - 1 ? '1px solid #dee2e6' : 'none',
                                        display:'flex',
                                        justifyContent:'space-between',
                                        alignItems:'center'
                                      }}>
                                        <div style={{flex:1}}>
                                          <div style={{
                                            fontWeight:'600',
                                            color:'#333',
                                            fontSize:'14px',
                                            marginBottom:'4px'
                                          }}>
                                            {productName}
                                          </div>
                                          
                                          {productDescription && (
                                            <div style={{
                                              fontSize:'12px',
                                              color:'#666',
                                              marginBottom:'4px',
                                              fontStyle:'italic'
                                            }}>
                                              {productDescription}
                                            </div>
                                          )}
                                          
                                          <div style={{
                                            fontSize:'12px',
                                            color:'#888'
                                          }}>
                                            Quantity: {itemQuantity}
                                          </div>
                                      </div>
                                      <div style={{
                                        textAlign:'right',
                                        marginLeft:'16px'
                                      }}>
                                        <div style={{
                                          fontWeight:'600',
                                          color:'#f9a825',
                                          fontSize:'14px'
                                        }}>
                                          Rs. {productPrice.toFixed(2)}
                                        </div>
                                        {itemQuantity > 1 && (
                                          <div style={{
                                            fontSize:'12px',
                                            color:'#666'
                                          }}>
                                            Rs. {(productPrice * itemQuantity).toFixed(2)} total
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                  })}
                                </div>
                              );
                            } else {
                              return (
                                <div style={{
                                  padding:'16px',
                                  textAlign:'center',
                                  color:'#666',
                                  fontSize:'14px'
                                }}>
                                  No items information available
                                </div>
                              );
                            }
                          } catch (error) {
                            return (
                              <div style={{
                                padding:'16px',
                                textAlign:'center',
                                color:'#dc3545',
                                fontSize:'14px'
                              }}>
                                Unable to display items
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setViewedUserOrder(null)}
                      style={{
                        padding:'10px 20px',
                        backgroundColor:'#6c757d',
                        color:'#fff',
                        border:'none',
                        borderRadius:'6px',
                        cursor:'pointer',
                        fontSize:'14px',
                        fontWeight:'500'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blogs Page */}
        {page==='blogs' && (
          <div style={{
            fontFamily:'Nunito, Open Sans, Arial',
            padding:'40px 24px',
            margin:0,
            minHeight:'70vh',
            background:'linear-gradient(135deg,#f8fafc 0%,#e3f2fd 100%)'
          }}>
            <div style={{
              maxWidth:'1200px',
              margin:'0 auto',
              background:'#fff',
              borderRadius:'12px',
              padding:'40px',
              boxShadow:'0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h1 style={{
                textAlign:'center',
                color:'#f9a825',
                marginBottom:'30px',
                fontWeight:'700',
                fontSize:'32px'
              }}>
                Our Blog
              </h1>
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
                gap:'24px',
                marginTop:'30px'
              }}>
                {/* Sample blog posts */}
                <article style={{
                  border:'1px solid #eee',
                  borderRadius:'12px',
                  overflow:'hidden',
                  backgroundColor:'#fff',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                  transition:'transform 0.2s'
                }}>
                  <div style={{
                    width:'100%',
                    height:'200px',
                    backgroundColor:'#e8f5e8',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:'48px'
                  }}>
                    🥬
                  </div>
                  <div style={{padding:'20px'}}>
                    <h3 style={{
                      margin:'0 0 12px',
                      color:'#333',
                      fontSize:'20px',
                      fontWeight:'600'
                    }}>
                      Fresh Vegetables: Health Benefits & Tips
                    </h3>
                    <p style={{
                      color:'#666',
                      fontSize:'14px',
                      lineHeight:'1.5',
                      marginBottom:'16px'
                    }}>
                      Discover the amazing health benefits of fresh vegetables and learn how to incorporate more greens into your daily diet for optimal wellness.
                    </p>
                    <div style={{
                      display:'flex',
                      justifyContent:'space-between',
                      alignItems:'center',
                      fontSize:'12px',
                      color:'#888'
                    }}>
                      <span>Published: Oct 8, 2025</span>
                      <span>5 min read</span>
                    </div>
                  </div>
                </article>

                <article style={{
                  border:'1px solid #eee',
                  borderRadius:'12px',
                  overflow:'hidden',
                  backgroundColor:'#fff',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                  transition:'transform 0.2s'
                }}>
                  <div style={{
                    width:'100%',
                    height:'200px',
                    backgroundColor:'#fff3e0',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:'48px'
                  }}>
                    🍞
                  </div>
                  <div style={{padding:'20px'}}>
                    <h3 style={{
                      margin:'0 0 12px',
                      color:'#333',
                      fontSize:'20px',
                      fontWeight:'600'
                    }}>
                      Artisan Bakery: From Grain to Bread
                    </h3>
                    <p style={{
                      color:'#666',
                      fontSize:'14px',
                      lineHeight:'1.5',
                      marginBottom:'16px'
                    }}>
                      Explore the traditional art of bread making and learn about the journey from wheat grain to your favorite artisan loaf.
                    </p>
                    <div style={{
                      display:'flex',
                      justifyContent:'space-between',
                      alignItems:'center',
                      fontSize:'12px',
                      color:'#888'
                    }}>
                      <span>Published: Oct 5, 2025</span>
                      <span>7 min read</span>
                    </div>
                  </div>
                </article>

                <article style={{
                  border:'1px solid #eee',
                  borderRadius:'12px',
                  overflow:'hidden',
                  backgroundColor:'#fff',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                  transition:'transform 0.2s'
                }}>
                  <div style={{
                    width:'100%',
                    height:'200px',
                    backgroundColor:'#e1f5fe',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:'48px'
                  }}>
                    🥛
                  </div>
                  <div style={{padding:'20px'}}>
                    <h3 style={{
                      margin:'0 0 12px',
                      color:'#333',
                      fontSize:'20px',
                      fontWeight:'600'
                    }}>
                      Farm Fresh Dairy Products
                    </h3>
                    <p style={{
                      color:'#666',
                      fontSize:'14px',
                      lineHeight:'1.5',
                      marginBottom:'16px'
                    }}>
                      Learn about our partnership with local farms and how we ensure the highest quality dairy products reach your table.
                    </p>
                    <div style={{
                      display:'flex',
                      justifyContent:'space-between',
                      alignItems:'center',
                      fontSize:'12px',
                      color:'#888'
                    }}>
                      <span>Published: Oct 3, 2025</span>
                      <span>4 min read</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Employee Dashboard */}
        {page === 'employee-delivery' && employee && employee.role === 'Delivery' && (
          <DeliveryEmployeeDashboard 
            employee={employee} 
            onSignOut={signOut}
          />
        )}

        {/* Worker Employee Dashboard */}
        {page === 'employee-worker' && employee && employee.role === 'Worker' && (
          <WorkerDashboard 
            employee={employee} 
            onSignOut={signOut}
          />
        )}

        {/* Employee Payment Handler Dashboard */}
        {page === 'employee-payments' && employee && employee.role === 'Payment Handler' && (
          <PaymentHandlerDashboard 
            employee={employee} 
            onSignOut={signOut}
          />
        )}

        {/* OLD INLINE PAYMENT DASHBOARD - REMOVED AND REPLACED WITH COMPONENT */}
        {false && page === 'employee-payments' && employee && employee.role === 'Payment Handler' && (
          <div style={{maxWidth:'1200px', margin:'0 auto', padding:'20px'}}>
            <div style={{marginTop:'20px'}}>
              <div style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                marginBottom:'30px'
              }}>
                <h1 style={{
                  margin:'0',
                  color:'#7b1fa2',
                  fontSize:'32px',
                  fontWeight:'700'
                }}>
                  Payment Dashboard
                </h1>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                  <div style={{color:'#666', fontSize:'16px'}}>
                    Welcome, {employee.name} ({employee.role})
                  </div>
                  <button 
                    onClick={() => {
                      console.log('Employee signing out...');
                      // Set user to guest mode (same as regular user sign out)
                      setUser({ guest: true });
                      setEmployee(null);
                      setCart([]);
                      setPage('home');
                      setLoginType('customer');
                      
                      // Clear localStorage
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('employeeData');
                      localStorage.removeItem('userId');
                      localStorage.removeItem('userType');
                      
                      // Reset any modal states
                      setShowEmployeeLogin(false);
                      setShowLogin(false);
                      setShowRegister(false);
                      setShowManagerLogin(false);
                      setShowManagerRegister(false);
                      
                      // Reset forms
                      setForm({});
                      setEmployeeLoginForm({email:'', password:''});
                      
                      console.log('Sign out complete - now browsing as guest');
                      showPopupMsg('Signed out successfully - You can continue browsing as a guest');
                    }}
                    style={{
                      padding:'8px 16px',
                      backgroundColor:'#d32f2f',
                      color:'white',
                      border:'none',
                      borderRadius:'6px',
                      fontSize:'14px',
                      fontWeight:'600',
                      cursor:'pointer',
                      transition:'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c62828'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#d32f2f'}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>

              {/* Payment Stats - Real Data */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',
                gap:'20px',
                marginBottom:'30px'
              }}>
                <div style={{
                  backgroundColor:'#f3e5f5',
                  padding:'20px',
                  borderRadius:'12px',
                  textAlign:'center'
                }}>
                  <h3 style={{margin:'0 0 8px', color:'#7b1fa2', fontSize:'24px'}}>
                    {orders.filter(o => o.paymentMethod === 'bank').length}
                  </h3>
                  <p style={{margin:'0', color:'#666'}}>Total Bank Payment Orders</p>
                </div>
                <div style={{
                  backgroundColor:'#fff3e0',
                  padding:'20px',
                  borderRadius:'12px',
                  textAlign:'center'
                }}>
                  <h3 style={{margin:'0 0 8px', color:'#f57c00', fontSize:'24px'}}>
                    {orders.filter(o => o.paymentMethod === 'bank' && o.status === 'review').length}
                  </h3>
                  <p style={{margin:'0', color:'#666'}}>Pending Review</p>
                </div>
                <div style={{
                  backgroundColor:'#e8f5e8',
                  padding:'20px',
                  borderRadius:'12px',
                  textAlign:'center'
                }}>
                  <h3 style={{margin:'0 0 8px', color:'#2e7d32', fontSize:'24px'}}>
                    {orders.filter(o => o.paymentMethod === 'bank' && o.status === 'placed').length}
                  </h3>
                  <p style={{margin:'0', color:'#666'}}>Approved Payments</p>
                </div>
                <div style={{
                  backgroundColor:'#ffebee',
                  padding:'20px',
                  borderRadius:'12px',
                  textAlign:'center'
                }}>
                  <h3 style={{margin:'0 0 8px', color:'#c62828', fontSize:'24px'}}>
                    {orders.filter(o => o.paymentMethod === 'bank' && o.status === 'rejected').length}
                  </h3>
                  <p style={{margin:'0', color:'#666'}}>Rejected Payments</p>
                </div>
              </div>

              {/* Recent Transactions */}
              <div style={{
                backgroundColor:'white',
                borderRadius:'12px',
                padding:'24px',
                boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                marginBottom:'20px'
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                  <h2 style={{margin:'0', color:'#333', fontSize:'20px'}}>Recent Bank Payment Orders</h2>
                  <button 
                    onClick={() => {
                      console.log('🔄 Refreshing orders...');
                      fetchOrders();
                    }}
                    style={{
                      padding:'8px 16px',
                      backgroundColor:'#7b1fa2',
                      color:'white',
                      border:'none',
                      borderRadius:'6px',
                      fontSize:'14px',
                      fontWeight:'600',
                      cursor:'pointer',
                      transition:'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#6a1b9a'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#7b1fa2'}
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                {loadingOrders ? (
                  <div style={{padding:'40px', textAlign:'center', color:'#666'}}>
                    <div style={{fontSize:'24px', marginBottom:'12px'}}>⏳</div>
                    <div>Loading orders...</div>
                  </div>
                ) : orderError ? (
                  <div style={{padding:'20px', textAlign:'center', color:'#d32f2f', backgroundColor:'#ffebee', borderRadius:'8px'}}>
                    <div style={{fontSize:'20px', marginBottom:'8px'}}>⚠️</div>
                    <div>{orderError}</div>
                  </div>
                ) : orders.filter(order => order.paymentMethod === 'bank').length === 0 ? (
                  <div style={{padding:'40px', textAlign:'center', color:'#666'}}>
                    <div style={{fontSize:'48px', marginBottom:'16px'}}>💳</div>
                    <div style={{fontSize:'18px', fontWeight:'600', marginBottom:'8px'}}>No bank payment orders yet</div>
                    <div style={{fontSize:'14px', color:'#999'}}>Orders with bank payment receipts will appear here</div>
                  </div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                    {(Array.isArray(orders) ? orders : []).filter(order => order.paymentMethod === 'bank').slice(0, 10).map(order => (
                      <div key={order.id} style={{
                        border:'2px solid #7b1fa2',
                        borderRadius:'12px',
                        padding:'20px',
                        backgroundColor:'#fafafa'
                      }}>
                        {/* Order Header */}
                        <div style={{
                          display:'flex',
                          justifyContent:'space-between',
                          alignItems:'flex-start',
                          marginBottom:'16px'
                        }}>
                          <div>
                            <div style={{fontWeight:'700', fontSize:'18px', color:'#7b1fa2', marginBottom:'4px'}}>
                              Order #{order.id}
                            </div>
                            <div style={{fontSize:'14px', color:'#666', marginBottom:'2px'}}>
                              <strong>Customer:</strong> {order.customerName || 'N/A'}
                            </div>
                            <div style={{fontSize:'14px', color:'#666', marginBottom:'2px'}}>
                              <strong>Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
                            </div>
                            <div style={{fontSize:'14px', color:'#666', marginBottom:'2px'}}>
                              <strong>Status:</strong> <span style={{
                                padding:'6px 12px',
                                borderRadius:'6px',
                                backgroundColor: 
                                  order.status === 'delivered' ? '#e8f5e8' : 
                                  order.status === 'placed' ? '#e3f2fd' :
                                  order.status === 'rejected' ? '#ffebee' :
                                  order.status === 'review' ? '#fff3e0' :
                                  '#f5f5f5',
                                color: 
                                  order.status === 'delivered' ? '#2e7d32' : 
                                  order.status === 'placed' ? '#1976d2' :
                                  order.status === 'rejected' ? '#c62828' :
                                  order.status === 'review' ? '#f57c00' :
                                  '#666',
                                fontSize:'13px',
                                fontWeight:'700',
                                textTransform:'uppercase',
                                letterSpacing:'0.5px'
                              }}>
                                {order.status === 'review' ? '⏳ Under Review' : 
                                 order.status === 'placed' ? '✓ Approved' :
                                 order.status === 'rejected' ? '✗ Rejected' :
                                 order.status === 'delivered' ? '✓ Delivered' :
                                 order.status || 'pending'}
                              </span>
                            </div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'20px', fontWeight:'700', color:'#2e7d32', marginBottom:'4px'}}>
                              Rs. {order.total ? order.total.toFixed(2) : '0.00'}
                            </div>
                            <div style={{
                              fontSize:'13px',
                              fontWeight:'600',
                              color:'#7b1fa2',
                              padding:'4px 8px',
                              backgroundColor:'#f3e5f5',
                              borderRadius:'4px',
                              display:'inline-block'
                            }}>
                              💳 Bank Payment
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div style={{
                            marginBottom:'16px',
                            padding:'12px',
                            backgroundColor:'white',
                            borderRadius:'8px',
                            border:'1px solid #e0e0e0'
                          }}>
                            <div style={{fontWeight:'600', marginBottom:'8px', fontSize:'14px'}}>Order Items:</div>
                            <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                              {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                                <div key={idx} style={{fontSize:'13px', color:'#666', paddingLeft:'12px'}}>
                                  • {item.productName || `Product #${item.productId}`} - 
                                  Qty: {item.quantity} × Rs. {item.price ? item.price.toFixed(2) : '0.00'} = 
                                  Rs. {item.quantity && item.price ? (item.quantity * item.price).toFixed(2) : '0.00'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Payment Receipt */}
                        <div style={{
                          marginTop:'12px',
                          padding:'16px',
                          backgroundColor:'white',
                          borderRadius:'8px',
                          border:'2px dashed #7b1fa2'
                        }}>
                          <div style={{fontWeight:'600', marginBottom:'12px', color:'#7b1fa2', fontSize:'15px'}}>
                            📄 Payment Receipt:
                          </div>
                          {order.paymentReceipt ? (
                            <div>
                              <img 
                                src={order.paymentReceipt.startsWith('data:') ? order.paymentReceipt : `data:image/jpeg;base64,${order.paymentReceipt}`}
                                alt="Payment Receipt" 
                                style={{
                                  maxWidth:'100%',
                                  maxHeight:'400px',
                                  borderRadius:'8px',
                                  border:'2px solid #ddd',
                                  display:'block',
                                  margin:'0 auto',
                                  cursor:'pointer',
                                  objectFit:'contain',
                                  backgroundColor:'#f5f5f5'
                                }}
                                onClick={() => {
                                  const imgSrc = order.paymentReceipt.startsWith('data:') ? order.paymentReceipt : `data:image/jpeg;base64,${order.paymentReceipt}`;
                                  window.open(imgSrc, '_blank');
                                }}
                                title="Click to open in new tab"
                                onError={(e) => {
                                  console.error('Image load error for order', order.id, 'Receipt data:', order.paymentReceipt?.substring(0, 50));
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                              />
                              <div style={{
                                display:'none',
                                padding:'20px',
                                textAlign:'center',
                                color:'#d32f2f',
                                backgroundColor:'#ffebee',
                                borderRadius:'6px',
                                fontSize:'14px'
                              }}>
                                ⚠️ Error loading receipt image. The image data may be corrupted.
                              </div>
                              <div style={{
                                marginTop:'12px',
                                textAlign:'center',
                                fontSize:'12px',
                                color:'#666'
                              }}>
                                Click image to view full size
                              </div>
                              {/* Action Buttons */}
                              <div style={{
                                display:'flex',
                                gap:'12px',
                                marginTop:'16px',
                                justifyContent:'center'
                              }}>
                                <button
                                  onClick={() => approvePayment(order.id)}
                                  disabled={order.status === 'placed' || order.status === 'delivered'}
                                  style={{
                                    padding:'10px 20px',
                                    backgroundColor: order.status === 'placed' || order.status === 'delivered' ? '#ccc' : '#2e7d32',
                                    color:'white',
                                    border:'none',
                                    borderRadius:'6px',
                                    fontSize:'14px',
                                    fontWeight:'600',
                                    cursor: order.status === 'placed' || order.status === 'delivered' ? 'not-allowed' : 'pointer',
                                    opacity: order.status === 'placed' || order.status === 'delivered' ? 0.6 : 1
                                  }}
                                  title={order.status === 'placed' || order.status === 'delivered' ? 'Payment already approved' : 'Approve this payment'}
                                >
                                  {order.status === 'placed' || order.status === 'delivered' ? '✓ Approved' : '✓ Approve Payment'}
                                </button>
                                <button
                                  onClick={() => rejectPayment(order.id)}
                                  disabled={order.status === 'rejected' || order.status === 'placed' || order.status === 'delivered'}
                                  style={{
                                    padding:'10px 20px',
                                    backgroundColor: order.status === 'rejected' ? '#666' : (order.status === 'placed' || order.status === 'delivered' ? '#ccc' : '#d32f2f'),
                                    color:'white',
                                    border:'none',
                                    borderRadius:'6px',
                                    fontSize:'14px',
                                    fontWeight:'600',
                                    cursor: order.status === 'rejected' || order.status === 'placed' || order.status === 'delivered' ? 'not-allowed' : 'pointer',
                                    opacity: order.status === 'rejected' || order.status === 'placed' || order.status === 'delivered' ? 0.6 : 1
                                  }}
                                  title={order.status === 'rejected' ? 'Payment already rejected' : (order.status === 'placed' || order.status === 'delivered' ? 'Cannot reject approved order' : 'Reject this payment')}
                                >
                                  {order.status === 'rejected' ? '✗ Rejected' : '✗ Reject Payment'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              padding:'20px',
                              textAlign:'center',
                              color:'#d32f2f',
                              backgroundColor:'#ffebee',
                              borderRadius:'6px',
                              fontSize:'14px'
                            }}>
                              ⚠️ No receipt uploaded for this order
                            </div>
                          )}
                        </div>

                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                          <div style={{
                            marginTop:'12px',
                            padding:'12px',
                            backgroundColor:'#f5f5f5',
                            borderRadius:'8px',
                            fontSize:'13px',
                            color:'#666'
                          }}>
                            <strong>📍 Delivery Address:</strong> {order.deliveryAddress}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Orders (Cash + Bank) */}
              <div style={{
                backgroundColor:'white',
                borderRadius:'12px',
                padding:'24px',
                boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                marginBottom:'20px'
              }}>
                <h2 style={{margin:'0 0 20px', color:'#333', fontSize:'20px'}}>All Recent Orders</h2>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  {(Array.isArray(orders) ? orders : []).slice(0, 10).map(order => (
                    <div key={order.id} style={{
                      border:'1px solid #eee',
                      borderRadius:'8px',
                      padding:'16px',
                      display:'flex',
                      justifyContent:'space-between',
                      alignItems:'center',
                      backgroundColor: order.paymentMethod === 'bank' ? '#f3e5f5' : 'white'
                    }}>
                      <div>
                        <div style={{fontWeight:'600', marginBottom:'4px'}}>
                          Order #{order.id}
                        </div>
                        <div style={{fontSize:'14px', color:'#666'}}>
                          Customer: {order.customerName || 'N/A'} | 
                          Method: {order.paymentMethod === 'bank' ? '💳 Bank Payment' : '💵 Cash on Delivery'}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'16px', fontWeight:'600', color:'#2e7d32'}}>
                          Rs. {order.total ? order.total.toFixed(2) : '0.00'}
                        </div>
                        <div style={{fontSize:'12px', color:'#666'}}>
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Summary */}
              <div style={{
                backgroundColor:'white',
                borderRadius:'12px',
                padding:'24px',
                boxShadow:'0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{margin:'0 0 20px', color:'#333', fontSize:'20px'}}>Payment Methods Summary</h2>
                <div style={{
                  display:'grid',
                  gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',
                  gap:'16px'
                }}>
                  <div style={{
                    border:'1px solid #eee',
                    borderRadius:'8px',
                    padding:'16px',
                    textAlign:'center'
                  }}>
                    <div style={{fontSize:'18px', fontWeight:'600', color:'#1976d2'}}>Rs. 1,820</div>
                    <div style={{fontSize:'14px', color:'#666', marginTop:'4px'}}>Credit Cards</div>
                  </div>
                  <div style={{
                    border:'1px solid #eee',
                    borderRadius:'8px',
                    padding:'16px',
                    textAlign:'center'
                  }}>
                    <div style={{fontSize:'18px', fontWeight:'600', color:'#2e7d32'}}>Rs. 430</div>
                    <div style={{fontSize:'14px', color:'#666', marginTop:'4px'}}>Cash</div>
                  </div>
                  <div style={{
                    border:'1px solid #eee',
                    borderRadius:'8px',
                    padding:'16px',
                    textAlign:'center'
                  }}>
                    <div style={{fontSize:'18px', fontWeight:'600', color:'#ef6c00'}}>Rs. 200</div>
                    <div style={{fontSize:'14px', color:'#666', marginTop:'4px'}}>Digital Wallets</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Employee Login Modal */}
      {showEmployeeLogin && (
        <div style={{
          position:'fixed',
          top:'0',
          left:'0',
          right:'0',
          bottom:'0',
          backgroundColor:'rgba(0,0,0,0.5)',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          zIndex:'1001'
        }}>
          <div style={{
            backgroundColor:'white',
            borderRadius:'16px',
            padding:'32px',
            width:'90%',
            maxWidth:'500px',
            maxHeight:'90vh',
            overflow:'auto',
            position:'relative',
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowEmployeeLogin(false)}
              style={{
                position:'absolute',
                top:'16px',
                right:'16px',
                background:'none',
                border:'none',
                fontSize:'24px',
                cursor:'pointer',
                color:'#666',
                padding:'4px',
                borderRadius:'50%'
              }}
            >
              ×
            </button>

            {/* Modal Header */}
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <h2 style={{
                margin:'0 0 8px',
                color:'#333',
                fontSize:'24px',
                fontWeight:'700'
              }}>
                Staff Login
              </h2>
              <p style={{
                margin:'0',
                color:'#666',
                fontSize:'14px'
              }}>
                Access your employee dashboard
              </p>
            </div>

            {/* Quick Demo Login Buttons */}
            <div style={{marginBottom:'24px'}}>
              <h3 style={{
                margin:'0 0 16px',
                color:'#333',
                fontSize:'16px',
                fontWeight:'600',
                textAlign:'center'
              }}>
                Quick Demo Login
              </h3>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                <button
                  onClick={() => employeeLogin({ 
                    email: 'delivery@demo.com', 
                    password: 'demo123',
                    role: 'Delivery'
                  })}
                  style={{
                    padding:'12px 16px',
                    backgroundColor:'#2e7d32',
                    color:'white',
                    border:'none',
                    borderRadius:'8px',
                    fontSize:'14px',
                    fontWeight:'600',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:'8px',
                    justifyContent:'center',
                    transition:'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1b5e20'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2e7d32'}
                >
                  🚚 Login as Delivery Staff
                </button>
                
                <button
                  onClick={() => employeeLogin({ 
                    email: 'worker@demo.com', 
                    password: 'demo123',
                    role: 'Worker'
                  })}
                  style={{
                    padding:'12px 16px',
                    backgroundColor:'#1976d2',
                    color:'white',
                    border:'none',
                    borderRadius:'8px',
                    fontSize:'14px',
                    fontWeight:'600',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:'8px',
                    justifyContent:'center',
                    transition:'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0d47a1'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
                >
                  👷 Login as Store Worker
                </button>
                
                <button
                  onClick={() => employeeLogin({ 
                    email: 'payments@demo.com', 
                    password: 'demo123',
                    role: 'Payment Handler'
                  })}
                  style={{
                    padding:'12px 16px',
                    backgroundColor:'#7b1fa2',
                    color:'white',
                    border:'none',
                    borderRadius:'8px',
                    fontSize:'14px',
                    fontWeight:'600',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:'8px',
                    justifyContent:'center',
                    transition:'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4a148c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#7b1fa2'}
                >
                  💰 Login as Payment Handler
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              display:'flex',
              alignItems:'center',
              margin:'24px 0',
              gap:'16px'
            }}>
              <div style={{flex:'1', height:'1px', backgroundColor:'#e0e0e0'}}></div>
              <span style={{color:'#666', fontSize:'14px'}}>or use credentials</span>
              <div style={{flex:'1', height:'1px', backgroundColor:'#e0e0e0'}}></div>
            </div>

            {/* Login Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              employeeLogin(employeeLoginForm);
            }}>
              <div style={{marginBottom:'16px'}}>
                <label style={{
                  display:'block',
                  marginBottom:'6px',
                  color:'#333',
                  fontSize:'14px',
                  fontWeight:'600'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={employeeLoginForm.email}
                  onChange={(e) => setEmployeeLoginForm(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  style={{
                    width:'100%',
                    padding:'12px',
                    border:'2px solid #e0e0e0',
                    borderRadius:'8px',
                    fontSize:'14px',
                    boxSizing:'border-box',
                    outline:'none',
                    transition:'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  required
                />
              </div>

              <div style={{marginBottom:'16px'}}>
                <label style={{
                  display:'block',
                  marginBottom:'6px',
                  color:'#333',
                  fontSize:'14px',
                  fontWeight:'600'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={employeeLoginForm.password}
                  onChange={(e) => setEmployeeLoginForm(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  style={{
                    width:'100%',
                    padding:'12px',
                    border:'2px solid #e0e0e0',
                    borderRadius:'8px',
                    fontSize:'14px',
                    boxSizing:'border-box',
                    outline:'none',
                    transition:'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width:'100%',
                  padding:'14px',
                  backgroundColor:'#ff6f00',
                  color:'white',
                  border:'none',
                  borderRadius:'8px',
                  fontSize:'16px',
                  fontWeight:'600',
                  cursor:'pointer',
                  transition:'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e65100'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ff6f00'}
              >
                Login to Dashboard
              </button>
            </form>

            {/* Test Credentials Section */}
            <div style={{
              backgroundColor:'#f8f9fa',
              padding:'16px',
              borderRadius:'8px',
              marginTop:'20px',
              border:'1px solid #e9ecef'
            }}>
              <h4 style={{
                margin:'0 0 12px 0',
                color:'#495057',
                fontSize:'14px',
                fontWeight:'600',
                textAlign:'center'
              }}>
                Available Test Credentials
              </h4>
              <div style={{
                fontSize:'12px',
                lineHeight:'1.6',
                color:'#6c757d'
              }}>
                <div style={{marginBottom:'8px'}}>
                  <strong>🚚 Delivery:</strong> alex.rodriguez@grocery.com / password
                </div>
                <div style={{marginBottom:'8px'}}>
                  <strong>👷 Worker:</strong> sarah.johnson@grocery.com / password
                </div>
                <div>
                  <strong>💰 Payment Handler:</strong> lisa.davis@grocery.com / password
                </div>
              </div>
            </div>

            <div style={{
              textAlign:'center',
              marginTop:'20px',
              fontSize:'12px',
              color:'#666'
            }}>
              Need help? Contact your system administrator
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer style={{background:isEmployeePage ? 'linear-gradient(135deg, rgba(20, 20, 20, 0.98), rgba(15, 15, 15, 0.95))' : '#f8f9fa',backdropFilter:isEmployeePage ? 'blur(20px) saturate(180%)' : 'none',padding:isEmployeePage ? '24px 0' : '20px 0',borderTop:isEmployeePage ? '2px solid rgba(122, 183, 48, 0.3)' : '1px solid #eee',boxShadow:isEmployeePage ? '0 -4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(122, 183, 48, 0.2)' : 'none'}}>
        <div style={{textAlign:'center',color:isEmployeePage ? 'rgba(255, 255, 255, 0.6)' : '#888',fontSize:'14px',textShadow:isEmployeePage ? '0 2px 4px rgba(0, 0, 0, 0.5)' : 'none',fontFamily:'Open Sans, sans-serif'}}>
          © 2025 <span style={{color:isEmployeePage ? '#7AB730' : '#888',fontWeight:isEmployeePage ? 600 : 'normal'}}>Shanthi Stores</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
