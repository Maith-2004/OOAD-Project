import React, { useEffect, useState } from 'react';
import './HomePage.css';

// Swiper and Bootstrap JS should be loaded in public/index.html for carousels/tabs to work

export default function HomePage({ addToCart, cart = [], onNavigate, user, onCategoryClick }) {
  const [showCartMsg, setShowCartMsg] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qtys, setQtys] = useState({});

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Add to Cart handler
  function handleAddToCart(product, i) {
  const qty = qtys[product.id || i] || 1;
  if (typeof window.addToCart === 'function') window.addToCart(product); // fallback for demo
  if (typeof addToCart === 'function') addToCart({ ...product, cartQty: qty });
  setShowCartMsg(true);
  setTimeout(() => setShowCartMsg(false), 1200);
  }

  // Helper for product grid (trending, best sellers, etc.)
  const renderProductGrid = (count = 10) => (
    <div style={{display:'flex',flexWrap:'wrap',gap:'20px',padding:'0'}}>
      {(loading ? Array(count).fill({}) : products.slice(0, count)).map((product, i) => {
        const pid = product.id || i;
        const qty = qtys[pid] || 1;
        return (
          <div key={pid} style={{
            background:'#fff',
            borderRadius:'16px',
            boxShadow:'0 4px 16px rgba(0,0,0,0.08)',
            padding:'18px',
            position:'relative',
            width:'240px',
            height:'360px',
            display:'flex',
            flexDirection:'column',
            border:'1px solid #e8e8e8',
            transition:'all 0.3s ease',
            cursor:'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            {/* Discount badge */}
            <span style={{
              position:'absolute',
              top:'14px',
              left:'14px',
              background:'linear-gradient(135deg, #FFD54F, #FFCA28)',
              color:'#fff',
              fontWeight:'700',
              padding:'5px 12px',
              borderRadius:'8px',
              fontSize:'11px',
              zIndex:2,
              letterSpacing:'0.3px',
              boxShadow:'0 3px 10px rgba(255, 213, 79, 0.35)',
              fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif'
            }}>-30% OFF</span>
            
            {/* Heart icon */}
            <div style={{
              position:'absolute',
              top:'14px',
              right:'14px',
              width:'36px',
              height:'36px',
              background:'rgba(255,255,255,0.95)',
              borderRadius:'50%',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              cursor:'pointer',
              boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
              zIndex:2,
              transition:'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.25)';
              e.currentTarget.querySelector('svg').style.fill = '#f44336';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              e.currentTarget.querySelector('svg').style.fill = '#ccc';
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ccc" style={{transition:'fill 0.2s'}}>
                <path d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            
            {/* Product image - MAXIMUM SPACE */}
            <div style={{
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              height:'200px',
              marginBottom:'8px',
              borderRadius:'12px',
              backgroundColor:'#fafafa',
              overflow:'hidden',
              position:'relative'
            }}>
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
                style={{
                  width:'100%',
                  height:'100%',
                  objectFit:'contain',
                  objectPosition:'center'
                }} 
              />
            </div>
            
            {/* Product name */}
            <h3 style={{
              fontWeight:'600',
              fontSize:'15px',
              color:'#1a1a1a',
              margin:'0 0 4px 0',
              lineHeight:'1.2',
              fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif',
              letterSpacing:'-0.2px',
              overflow:'hidden',
              textOverflow:'ellipsis',
              display:'-webkit-box',
              WebkitLineClamp:'2',
              WebkitBoxOrient:'vertical',
              minHeight:'36px'
            }}>{product.name || 'Sunstar Fresh Melon Juice'}</h3>
            
            {/* Product description */}
            <p style={{
              fontSize:'11px',
              color:'#6b7280',
              margin:'0 0 4px 0',
              lineHeight:'1.3',
              fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif',
              overflow:'hidden',
              textOverflow:'ellipsis',
              display:'-webkit-box',
              WebkitLineClamp:'2',
              WebkitBoxOrient:'vertical',
              minHeight:'28px'
            }}>{product.description || 'Fresh and high quality product for your daily needs'}</p>
            
            {/* Rating */}
            <div style={{
              display:'flex',
              alignItems:'center',
              gap:'6px',
              margin:'0 0 4px 0'
            }}>
              <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB400">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span style={{
                  fontSize:'12px',
                  fontWeight:'700',
                  color:'#1a1a1a',
                  fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif'
                }}>4.5</span>
              </div>
              <span style={{
                fontSize:'10px',
                color:'#9ca3af',
                fontWeight:'500',
                fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif'
              }}>• 1 UNIT</span>
            </div>
            
            {/* Price - LIGHT YELLOW COLOR */}
            <div style={{
              fontSize:'20px',
              fontWeight:'800',
              color:'#FFA726',
              margin:'0 0 8px 0',
              fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif',
              letterSpacing:'-0.5px'
            }}>
              <span style={{fontSize:'14px', fontWeight:'600'}}>Rs.</span> {product.price ? product.price.toFixed(2) : '18.00'}
            </div>
            
            {/* Quantity controls and Add to Cart - YELLOW THEME */}
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'auto'}}>
              <button 
                type="button" 
                style={{
                  width:'36px',
                  height:'36px',
                  border:'1px solid #e0e0e0',
                  background:'#fff',
                  borderRadius:'8px',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  cursor:'pointer',
                  fontSize:'18px',
                  fontWeight:'600',
                  color:'#4a5568',
                  transition:'all 0.2s',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.06)'
                }} 
                onClick={() => setQtys(q => ({ ...q, [pid]: Math.max(1, (q[pid] || 1) - 1) }))}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FFF9E6';
                  e.target.style.borderColor = '#FFE082';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                −
              </button>
              <span style={{
                fontWeight:'700',
                fontSize:'15px',
                minWidth:'30px',
                textAlign:'center',
                color:'#1a1a1a',
                fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif'
              }}>{qty}</span>
              <button 
                type="button" 
                style={{
                  width:'36px',
                  height:'36px',
                  border:'1px solid #e0e0e0',
                  background:'#fff',
                  borderRadius:'8px',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  cursor:'pointer',
                  fontSize:'18px',
                  fontWeight:'600',
                  color:'#4a5568',
                  transition:'all 0.2s',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.06)'
                }} 
                onClick={() => setQtys(q => ({ ...q, [pid]: (q[pid] || 1) + 1 }))}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FFF9E6';
                  e.target.style.borderColor = '#FFE082';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                +
              </button>
              <button 
                style={{
                  flex:1,
                  marginLeft:'6px',
                  background:'linear-gradient(135deg, #FFD54F, #FFCA28)',
                  color:'#fff',
                  fontWeight:'700',
                  fontSize:'14px',
                  padding:'11px 16px',
                  border:'none',
                  borderRadius:'8px',
                  cursor:'pointer',
                  transition:'all 0.3s',
                  fontFamily:'"Inter", "Segoe UI", system-ui, sans-serif',
                  letterSpacing:'0.3px',
                  boxShadow:'0 4px 14px rgba(255, 213, 79, 0.3)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'6px'
                }} 
                onClick={() => handleAddToCart(product, i)}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow='0 6px 18px rgba(255, 213, 79, 0.45)';
                  e.target.style.transform='translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow='0 4px 14px rgba(255, 213, 79, 0.3)';
                  e.target.style.transform='translateY(0)';
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );



  return (
    <div className="shanthi-stores-home">

      {/* Admin Button for Managers */}
      {user && user.role === 'manager' && (
        <div style={{position:'fixed',bottom:24,right:24,zIndex:9999}}>
          <button 
            onClick={() => onNavigate('admin')}
            style={{
              background:'linear-gradient(135deg, #7b1fa2, #9c27b0)',
              color:'#fff',
              border:'none',
              borderRadius:'50%',
              width:60,
              height:60,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              cursor:'pointer',
              boxShadow:'0 4px 16px rgba(123,31,162,0.3)',
              fontSize:24,
              fontWeight:700,
              transition:'all 0.3s ease',
              transform:'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(123,31,162,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 16px rgba(123,31,162,0.3)';
            }}
            title="Admin Dashboard"
          >
            ⚙️
          </button>
        </div>
      )}

      {/* Cart notification */}
      {showCartMsg && (
        <div style={{position:'fixed',top:24,right:24,zIndex:9999,background:'#198754',color:'#fff',padding:'12px 32px',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.12)',fontWeight:700}}>
          Added to cart!
        </div>
      )}

      {/* Cart Sidebar/Modal */}
      {/* Banner Blocks (Swiper carousel) */}
      <section className="py-3" style={{backgroundImage: "url('/FoodMart-1.0.0/images/background-pattern.jpg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', position: 'relative', zIndex: 1}}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="banner-blocks" style={{position: 'relative', zIndex: 1}}>
                <div className="banner-ad large bg-info block-1" style={{position: 'relative', zIndex: 1}}>
                  <div className="swiper main-swiper">
                    <div className="swiper-wrapper">
                      <div className="swiper-slide">
                        <div className="row banner-content p-5">
                          <div className="content-wrapper col-md-7">
                            <div className="categories my-3">100% natural</div>
                            <h3 className="display-4">Fresh Smoothie & Summer Juice</h3>
                            <p>Fresh groceries delivered to your door.</p>
                            <a href="#products" className="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1 px-4 py-3 mt-3">Shop Now</a>
                          </div>
                          <div className="img-wrapper col-md-5">
                            <img src="/FoodMart-1.0.0/images/product-thumb-1.png" className="img-fluid" alt="Banner" />
                          </div>
                        </div>
                      </div>
                      <div className="swiper-slide">
                        <div className="row banner-content p-5">
                          <div className="content-wrapper col-md-7">
                            <div className="categories mb-3 pb-3">100% natural</div>
                            <h3 className="banner-title">Fresh Smoothie & Summer Juice</h3>
                            <p>Best quality & variety. Shop fresh fruits, vegetables, and more.</p>
                            <a href="#products" className="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">Shop Collection</a>
                          </div>
                          <div className="img-wrapper col-md-5">
                            <img src="/FoodMart-1.0.0/images/product-thumb-1.png" className="img-fluid" alt="Banner" />
                          </div>
                        </div>
                      </div>
                      <div className="swiper-slide">
                        <div className="row banner-content p-5">
                          <div className="content-wrapper col-md-7">
                            <div className="categories mb-3 pb-3">100% natural</div>
                            <h3 className="banner-title">Heinz Tomato Ketchup</h3>
                            <p>Shop top brands and fresh groceries.</p>
                            <a href="#products" className="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">Shop Collection</a>
                          </div>
                          <div className="img-wrapper col-md-5">
                            <img src="/FoodMart-1.0.0/images/product-thumb-2.png" className="img-fluid" alt="Banner" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-pagination"></div>
                  </div>
                </div>
                <div className="banner-ad bg-success-subtle block-2" style={{background: "url('/FoodMart-1.0.0/images/ad-image-1.png') no-repeat", backgroundPosition: 'right bottom', position: 'relative', zIndex: 1}}>
                  <div className="row banner-content p-5">
                    <div className="content-wrapper col-md-7">
                      <div className="categories sale mb-3 pb-3">20% off</div>
                      <h3 className="banner-title">Fruits & Vegetables</h3>
                      <a href="#products" className="d-flex align-items-center nav-link">Shop Collection <svg width="24" height="24"><use xlinkHref="#arrow-right"></use></svg></a>
                    </div>
                  </div>
                </div>
                <div className="banner-ad bg-danger block-3" style={{background: "url('/FoodMart-1.0.0/images/ad-image-2.png') no-repeat", backgroundPosition: 'right bottom', position: 'relative', zIndex: 1}}>
                  <div className="row banner-content p-5">
                    <div className="content-wrapper col-md-7">
                      <div className="categories sale mb-3 pb-3">15% off</div>
                      <h3 className="item-title">Baked Products</h3>
                      <a href="#products" className="d-flex align-items-center nav-link">Shop Collection <svg width="24" height="24"><use xlinkHref="#arrow-right"></use></svg></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="section-header d-flex flex-wrap justify-content-between mb-5">
                <h2 className="section-title">Category</h2>
                <div className="d-flex align-items-center">
                  <a href="#" className="btn-link text-decoration-none">View All Categories →</a>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
              <div className="nav-link category-item text-center" style={{
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                cursor: 'pointer'
              }}
              onClick={() => onCategoryClick && onCategoryClick('grains')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}>
                <img src="/FoodMart-1.0.0/images/thumb-herb.jpg" alt="Rice Category" className="img-fluid rounded-circle mb-3" style={{width: '80px', height: '80px', objectFit: 'cover', transition: 'transform 0.3s ease'}} />
                <h3 className="category-title fs-6">Rice</h3>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
              <div className="nav-link category-item text-center" style={{
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                cursor: 'pointer'
              }}
              onClick={() => onCategoryClick && onCategoryClick('bakery')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}>
                <img src="/FoodMart-1.0.0/images/icon-bread-baguette.png" alt="Bread Category" className="img-fluid rounded-circle mb-3" style={{width: '80px', height: '80px', objectFit: 'cover', transition: 'transform 0.3s ease'}} />
                <h3 className="category-title fs-6">Bread & Bakery</h3>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
              <div className="nav-link category-item text-center" style={{
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                cursor: 'pointer'
              }}
              onClick={() => onCategoryClick && onCategoryClick('dairy')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}>
                <img src="/FoodMart-1.0.0/images/thumb-milk.png" alt="Dairy Category" className="img-fluid rounded-circle mb-3" style={{width: '80px', height: '80px', objectFit: 'cover', transition: 'transform 0.3s ease'}} />
                <h3 className="category-title fs-6">Dairy Products</h3>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
              <div className="nav-link category-item text-center" style={{
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                cursor: 'pointer'
              }}
              onClick={() => onCategoryClick && onCategoryClick('fruits')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}>
                <img src="/FoodMart-1.0.0/images/thumb-avocado.png" alt="Fruits Category" className="img-fluid rounded-circle mb-3" style={{width: '80px', height: '80px', objectFit: 'cover', transition: 'transform 0.3s ease'}} />
                <h3 className="category-title fs-6">Fruits</h3>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
              <div className="nav-link category-item text-center" style={{
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                cursor: 'pointer'
              }}
              onClick={() => onCategoryClick && onCategoryClick('vegetables')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}>
                <img src="/FoodMart-1.0.0/images/icon-vegetables-broccoli.png" alt="Vegetables Category" className="img-fluid rounded-circle mb-3" style={{width: '80px', height: '80px', objectFit: 'cover', transition: 'transform 0.3s ease'}} />
                <h3 className="category-title fs-6">Vegetables</h3>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
              <div className="nav-link category-item text-center" style={{
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                cursor: 'pointer'
              }}
              onClick={() => onCategoryClick && onCategoryClick('beverages')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}>
                <img src="/FoodMart-1.0.0/images/thumb-orange-juice.png" alt="Beverages Category" className="img-fluid rounded-circle mb-3" style={{width: '80px', height: '80px', objectFit: 'cover', transition: 'transform 0.3s ease'}} />
                <h3 className="category-title fs-6">Beverages</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Carousel */}
      <section className="py-5 overflow-hidden">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="section-header d-flex flex-wrap flex-wrap justify-content-between mb-5">
                <h2 className="section-title">Newly Arrived Brands</h2>
                <div className="d-flex align-items-center">
                  <a href="#" className="btn-link text-decoration-none">View All Categories →</a>
                  <div className="swiper-buttons">
                    <button className="swiper-prev brand-carousel-prev btn btn-yellow">❮</button>
                    <button className="swiper-next brand-carousel-next btn btn-yellow">❯</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="brand-carousel swiper">
                <div className="swiper-wrapper">
                  {/* Repeat brand cards as in template */}
                  <div className="swiper-slide">
                    <div className="card mb-3 p-3 rounded-4 shadow border-0">
                      <div className="row g-0">
                        <div className="col-md-4">
                          <img src="/FoodMart-1.0.0/images/product-thumb-11.jpg" className="img-fluid rounded" alt="Brand" />
                        </div>
                        <div className="col-md-8">
                          <div className="card-body py-0">
                            <p className="text-muted mb-0">Amber Jar</p>
                            <h5 className="card-title">Honey best nectar you wish to get</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ...repeat for other brands... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs (Trending, Fruits, Juices) */}
      <section style={{padding:'20px 0'}}>
        <div style={{width:'100%', padding:'0 16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom:'1px solid #eee', paddingBottom:'16px'}}>
            <h2 style={{fontSize:'24px', fontWeight:'700', color:'#333', margin:0}}>Trending Products</h2>
            <div style={{display:'flex', gap:'20px'}}>
              <button style={{background:'none', border:'none', color:'#333', fontWeight:'600', fontSize:'14px', cursor:'pointer', textTransform:'uppercase', padding:'8px 0', borderBottom:'2px solid #333'}}>All</button>
              <button style={{background:'none', border:'none', color:'#666', fontWeight:'500', fontSize:'14px', cursor:'pointer', textTransform:'uppercase', padding:'8px 0'}}>Fruits & Veges</button>
              <button style={{background:'none', border:'none', color:'#666', fontWeight:'500', fontSize:'14px', cursor:'pointer', textTransform:'uppercase', padding:'8px 0'}}>Juices</button>
            </div>
          </div>
          {renderProductGrid(8)}
        </div>
      </section>

      {/* Discount Banner */}
      <section className="py-5">
        <div className="container-fluid">
          <div className="bg-secondary py-5 my-5 rounded-5" style={{background: "url('/FoodMart-1.0.0/images/bg-leaves-img-pattern.png') no-repeat"}}>
            <div className="container my-5">
              <div className="row">
                <div className="col-md-6 p-5">
                  <div className="section-header">
                    <h2 className="section-title display-4">Get <span className="text-primary">25% Discount</span> on your first purchase</h2>
                  </div>
                  <p>Sign up and get a discount on your first order!</p>
                </div>
                <div className="col-md-6 p-5">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input type="text" className="form-control form-control-lg" name="name" id="name" placeholder="Name" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input type="email" className="form-control form-control-lg" name="email" id="email" placeholder="abc@mail.com" />
                    </div>
                    <div className="form-check form-check-inline mb-3">
                      <label className="form-check-label" htmlFor="subscribe">
                        <input className="form-check-input" type="checkbox" id="subscribe" value="subscribe" />
                        Subscribe to the newsletter
                      </label>
                    </div>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-dark btn-lg">Submit</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Selling Products */}
      <section style={{padding:'20px 0'}}>
        <div style={{width:'100%', padding:'0 16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'24px', fontWeight:'700', color:'#333', margin:0}}>Best selling products</h2>
            <a href="#" style={{color:'#666', textDecoration:'none', fontSize:'14px'}}>View All Categories →</a>
          </div>
          {renderProductGrid(8)}
        </div>
      </section>

      {/* Most Popular Products */}
      <section style={{padding:'20px 0'}}>
        <div style={{width:'100%', padding:'0 16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'24px', fontWeight:'700', color:'#333', margin:0}}>Most popular products</h2>
            <a href="#" style={{color:'#666', textDecoration:'none', fontSize:'14px'}}>View All Categories →</a>
          </div>
          {renderProductGrid(8)}
        </div>
      </section>

      {/* Just Arrived Products */}
      <section style={{padding:'20px 0'}}>
        <div style={{width:'100%', padding:'0 16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'24px', fontWeight:'700', color:'#333', margin:0}}>Just arrived</h2>
            <a href="#" style={{color:'#666', textDecoration:'none', fontSize:'14px'}}>View All Categories →</a>
          </div>
          {renderProductGrid(8)}
        </div>
      </section>

      {/* Footer Section */}
      {/* Blog Section */}
      <section id="latest-blog" className="py-5">
        <div className="container-fluid">
          <div className="row">
            <div className="section-header d-flex align-items-center justify-content-between my-5">
              <h2 className="section-title">Our Recent Blog</h2>
              <div className="btn-wrap align-right">
                <a href="#" className="d-flex align-items-center nav-link">Read All Articles <svg width="24" height="24"><use xlinkHref="#arrow-right"></use></svg></a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <article className="post-item card border-0 shadow-sm p-3">
                <div className="image-holder zoom-effect">
                  <a href="#"><img src="/FoodMart-1.0.0/images/post-thumb-1.jpg" alt="post" className="card-img-top" /></a>
                </div>
                <div className="card-body">
                  <div className="post-meta d-flex text-uppercase gap-3 my-2 align-items-center">
                    <div className="meta-date"><svg width="16" height="16"><use xlinkHref="#calendar"></use></svg>22 Aug 2021</div>
                    <div className="meta-categories"><svg width="16" height="16"><use xlinkHref="#category"></use></svg>tips & tricks</div>
                  </div>
                  <div className="post-header">
                    <h3 className="post-title"><a href="#" className="text-decoration-none">Top 10 casual look ideas to dress up your kids</a></h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipi elit. Aliquet eleifend viverra enim tincidunt donec quam. A in arcu, hendrerit neque dolor morbi...</p>
                  </div>
                </div>
              </article>
            </div>
            <div className="col-md-4">
              <article className="post-item card border-0 shadow-sm p-3">
                <div className="image-holder zoom-effect">
                  <a href="#"><img src="/FoodMart-1.0.0/images/post-thumb-2.jpg" alt="post" className="card-img-top" /></a>
                </div>
                <div className="card-body">
                  <div className="post-meta d-flex text-uppercase gap-3 my-2 align-items-center">
                    <div className="meta-date"><svg width="16" height="16"><use xlinkHref="#calendar"></use></svg>25 Aug 2021</div>
                    <div className="meta-categories"><svg width="16" height="16"><use xlinkHref="#category"></use></svg>trending</div>
                  </div>
                  <div className="post-header">
                    <h3 className="post-title"><a href="#" className="text-decoration-none">Latest trends of wearing street wears supremely</a></h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipi elit. Aliquet eleifend viverra enim tincidunt donec quam. A in arcu, hendrerit neque dolor morbi...</p>
                  </div>
                </div>
              </article>
            </div>
            <div className="col-md-4">
              <article className="post-item card border-0 shadow-sm p-3">
                <div className="image-holder zoom-effect">
                  <a href="#"><img src="/FoodMart-1.0.0/images/post-thumb-3.jpg" alt="post" className="card-img-top" /></a>
                </div>
                <div className="card-body">
                  <div className="post-meta d-flex text-uppercase gap-3 my-2 align-items-center">
                    <div className="meta-date"><svg width="16" height="16"><use xlinkHref="#calendar"></use></svg>28 Aug 2021</div>
                    <div className="meta-categories"><svg width="16" height="16"><use xlinkHref="#category"></use></svg>inspiration</div>
                  </div>
                  <div className="post-header">
                    <h3 className="post-title"><a href="#" className="text-decoration-none">10 Different Types of comfortable clothes ideas for women</a></h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipi elit. Aliquet eleifend viverra enim tincidunt donec quam. A in arcu, hendrerit neque dolor morbi...</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* App Promo Section */}
      <section className="py-5 my-5">
        <div className="container-fluid">
          <div className="bg-warning py-5 rounded-5" style={{backgroundImage: "url('/FoodMart-1.0.0/images/bg-pattern-2.png')", backgroundRepeat: 'no-repeat'}}>
            <div className="container">
              <div className="row">
                <div className="col-md-4">
                  <img src="/FoodMart-1.0.0/images/phone.png" alt="phone" className="image-float img-fluid" />
                </div>
                <div className="col-md-8">
                  <h2 className="my-5">Shop faster with Shanthi Stores App</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sagittis sed ptibus liberolectus nonet psryroin. Amet sed lorem posuere sit iaculis amet, ac urna. Adipiscing fames semper erat ac in suspendisse iaculis. Amet blandit tortor praesent ante vitae. A, enim pretiummi senectus magna. Sagittis sed ptibus liberolectus non et psryroin.</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <img src="/FoodMart-1.0.0/images/app-store.jpg" alt="app-store" />
                    <img src="/FoodMart-1.0.0/images/google-play.jpg" alt="google-play" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* People Also Search Section */}
      <section className="py-5">
        <div className="container-fluid">
          <h2 className="my-5">People are also looking for</h2>
          <a href="#" className="btn btn-warning me-2 mb-2">Blue diamon almonds</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Angie’s Boomchickapop Corn</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Salty kettle Corn</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Chobani Greek Yogurt</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Sweet Vanilla Yogurt</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Foster Farms Takeout Crispy wings</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Warrior Blend Organic</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Chao Cheese Creamy</a>
          <a href="#" className="btn btn-warning me-2 mb-2">Chicken meatballs</a>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-5">
        <div className="container-fluid">
          <div className="row row-cols-1 row-cols-sm-3 row-cols-lg-5">
            <div className="col">
              <div className="card mb-3 border-0">
                <div className="row">
                  <div className="col-md-2 text-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M21.5 15a3 3 0 0 0-1.9-2.78l1.87-7a1 1 0 0 0-.18-.87A1 1 0 0 0 20.5 4H6.8l-.33-1.26A1 1 0 0 0 5.5 2h-2v2h1.23l2.48 9.26a1 1 0 0 0 1 .74H18.5a1 1 0 0 1 0 2h-13a1 1 0 0 0 0 2h1.18a3 3 0 1 0 5.64 0h2.36a3 3 0 1 0 5.82 1a2.94 2.94 0 0 0-.4-1.47A3 3 0 0 0 21.5 15Zm-3.91-3H9L7.34 6H19.2ZM9.5 20a1 1 0 1 1 1-1a1 1 0 0 1-1 1Zm8 0a1 1 0 1 1 1-1a1 1 0 0 1-1 1Z"/></svg>
                  </div>
                  <div className="col-md-10">
                    <div className="card-body p-0">
                      <h5>Free delivery</h5>
                      <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card mb-3 border-0">
                <div className="row">
                  <div className="col-md-2 text-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M19.63 3.65a1 1 0 0 0-.84-.2a8 8 0 0 1-6.22-1.27a1 1 0 0 0-1.14 0a8 8 0 0 1-6.22 1.27a1 1 0 0 0-.84.2a1 1 0 0 0-.37.78v7.45a9 9 0 0 0 3.77 7.33l3.65 2.6a1 1 0 0 0 1.16 0l3.65-2.6A9 9 0 0 0 20 11.88V4.43a1 1 0 0 0-.37-.78ZM18 11.88a7 7 0 0 1-2.93 5.7L12 19.77l-3.07-2.19A7 7 0 0 1 6 11.88v-6.3a10 10 0 0 0 6-1.39a10 10 0 0 0 6 1.39Zm-4.46-2.29l-2.69 2.7l-.89-.9a1 1 0 0 0-1.42 1.42l1.6 1.6a1 1 0 0 0 1.42 0L15 11a1 1 0 0 0-1.42-1.42Z"/></svg>
                  </div>
                  <div className="col-md-10">
                    <div className="card-body p-0">
                      <h5>100% secure payment</h5>
                      <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card mb-3 border-0">
                <div className="row">
                  <div className="col-md-2 text-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M22 5H2a1 1 0 0 0-1 1v4a3 3 0 0 0 2 2.82V22a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9.18A3 3 0 0 0 23 10V6a1 1 0 0 0-1-1Zm-7 2h2v3a1 1 0 0 1-2 0Zm-4 0h2v3a1 1 0 0 1-2 0ZM7 7h2v3a1 1 0 0 1-2 0Zm-3 4a1 1 0 0 1-1-1V7h2v3a1 1 0 0 1-1 1Zm10 10h-4v-2a2 2 0 0 1 4 0Zm5 0h-3v-2a4 4 0 0 0-8 0v2H5v-8.18a3.17 3.17 0 0 0 1-.6a3 3 0 0 0 4 0a3 3 0 0 0 4 0a3 3 0 0 0 4 0a3.17 3.17 0 0 0 1 .6Zm2-11a1 1 0 0 1-2 0V7h2ZM4.3 3H20a1 1 0 0 0 0-2H4.3a1 1 0 0 0 0 2Z"/></svg>
                  </div>
                  <div className="col-md-10">
                    <div className="card-body p-0">
                      <h5>Quality guarantee</h5>
                      <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card mb-3 border-0">
                <div className="row">
                  <div className="col-md-2 text-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8.35a3.07 3.07 0 0 0-3.54.53a3 3 0 0 0 0 4.24L11.29 16a1 1 0 0 0 1.42 0l2.83-2.83a3 3 0 0 0 0-4.24A3.07 3.07 0 0 0 12 8.35Zm2.12 3.36L12 13.83l-2.12-2.12a1 1 0 0 1 0-1.42a1 1 0 0 1 1.41 0a1 1 0 0 0 1.42 0a1 1 0 0 1 1.41 0a1 1 0 0 1 0 1.42ZM12 2A10 10 0 0 0 2 12a9.89 9.89 0 0 0 2.26 6.33l-2 2a1 1 0 0 0-.21 1.09A1 1 0 0 0 3 22h9a10 10 0 0 0 0-20Zm0 18H5.41l.93-.93a1 1 0 0 0 0-1.41A8 8 0 1 1 12 20Z"/></svg>
                  </div>
                  <div className="col-md-10">
                    <div className="card-body p-0">
                      <h5>guaranteed savings</h5>
                      <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card mb-3 border-0">
                <div className="row">
                  <div className="col-md-2 text-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M18 7h-.35A3.45 3.45 0 0 0 18 5.5a3.49 3.49 0 0 0-6-2.44A3.49 3.49 0 0 0 6 5.5A3.45 3.45 0 0 0 6.35 7H6a3 3 0 0 0-3 3v2a1 1 0 0 0 1 1h1v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6h1a1 1 0 0 0 1-1v-2a3 3 0 0 0-3-3Zm-7 13H8a1 1 0 0 1-1-1v-6h4Zm0-9H5v-1a1 1 0 0 1 1-1h5Zm0-4H9.5A1.5 1.5 0 1 1 11 5.5Zm2-1.5A1.5 1.5 0 1 1 14.5 7H13ZM17 19a1 1 0 0 1-1 1h-3v-7h4Zm2-8h-6V9h5a1 1 0 0 1 1 1Z"/></svg>
                  </div>
                  <div className="col-md-10">
                    <div className="card-body p-0">
                      <h5>Daily offers</h5>
                      <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Footer Section */}
      <footer className="py-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-menu">
                <img src="/FoodMart-1.0.0/images/a.png" alt="logo" />
                <div className="social-links mt-5">
                  <ul className="d-flex list-unstyled gap-2">
                    <li><a href="#" className="btn btn-outline-light"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.05.28-1.73 1.76-1.73Z"/></svg></a></li>
                    <li><a href="#" className="btn btn-outline-light"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22.991 3.95a1 1 0 0 0-1.51-.86a7.48 7.48 0 0 1-1.874.794a5.152 5.152 0 0 0-3.374-1.242a5.232 5.232 0 0 0-5.223 5.063a11.032 11.032 0 0 1-6.814-3.924a1.012 1.012 0 0 0-.857-.365a.999.999 0 0 0-.785.5a5.276 5.276 0 0 0-.242 4.769l-.002.001a1.041 1.041 0 0 0-.496.89a3.042 3.042 0 0 0 .027.439a5.185 5.185 0 0 0 1.568 3.312a.998.998 0 0 0-.066.77a5.204 5.204 0 0 0 2.362 2.922a7.465 7.465 0 0 1-3.59.448A1 1 0 0 0 1.45 19.3a12.942 12.942 0 0 0 7.01 2.061a12.788 12.788 0 0 0 12.465-9.363a12.822 12.822 0 0 0 .535-3.646l-.001-.2a5.77 5.77 0 0 0 1.532-4.202Zm-3.306 3.212a.995.995 0 0 0-.234.702c.01.165.009.331.009.488a10.824 10.824 0 0 1-.454 3.08a10.685 10.685 0 0 1-10.546 7.93a10.938 10.938 0 0 1-2.55-.301a9.48 9.48 0 0 0 2.942-1.564a1 1 0 0 0-.602-1.786a3.208 3.208 0 0 1-2.214-.935q.224-.042.445-.105a1 1 0 0 0-.08-1.943a3.198 3.198 0 0 1-2.25-1.726a5.3 5.3 0 0 0 .545.046a1.02 1.02 0 0 0 .984-.696a1 1 0 0 0-.4-1.137a3.196 3.196 0 0 1-1.425-2.673c0-.066.002-.133.006-.198a13.014 13.014 0 0 0 8.21 3.48a1.02 1.02 0 0 0 .817-.36a1 1 0 0 0 .206-.867a3.157 3.157 0 0 1-.087-.729a3.23 3.23 0 0 1 3.226-3.226a3.184 3.184 0 0 1 2.345 1.02a.993.993 0 0 0 .921.298a9.27 9.27 0 0 0 1.212-.322a6.681 6.681 0 0 1-1.026 1.524Z"/></svg></a></li>
                    <li><a href="#" className="btn btn-outline-light"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M23 9.71a8.5 8.5 0 0 0-.91-4.13a2.92 2.92 0 0 0-1.72-1A78.36 78.36 0 0 0 12 4.27a78.45 78.45 0 0 0-8.34.3a2.87 2.87 0 0 0-1.46.74c-.9.83-1 2.25-1.1 3.45a48.29 48.29 0 0 0 0 6.48a9.55 9.55 0 0 0 .3 2a3.14 3.14 0 0 0 .71 1.36a2.86 2.86 0 0 0 1.49.78a45.18 45.18 0 0 0 6.5.33c3.5.05 6.57 0 10.2-.28a2.88 2.88 0 0 0 1.53-.78a2.49 2.49 0 0 0 .61-1a10.58 10.58 0 0 0 .52-3.4c.04-.56.04-3.94.04-4.54ZM9.74 14.85V8.66l5.92 3.11c-1.66.92-3.85 1.96-5.92 3.08Z"/></svg></a></li>
                    <li><a href="#" className="btn btn-outline-light"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2Zm4.6 2.42a7.59 7.59 0 0 0-.46-2.43a4.94 4.94 0 0 0-1.16-1.77a4.7 4.7 0 0 0-1.77-1.15a7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47a4.78 4.78 0 0 0-1.77 1.15a4.7 4.7 0 0 0-1.15 1.77a7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43a4.7 4.7 0 0 0 1.15 1.77a4.78 4.78 0 0 0 1.77 1.15a7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47a4.7 4.7 0 0 0 1.77-1.15a4.85 4.85 0 0 0 1.16-1.77a7.59 7.59 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12ZM20.14 16a5.61 5.61 0 0 1-.34 1.86a3.06 3.06 0 0 1-.75 1.15a3.19 3.19 0 0 1-1.15.75a5.61 5.61 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.73 5.73 0 0 1-1.94-.3a3.27 3.27 0 0 1-1.1-.75a3 3 0 0 1-.74-1.15a5.54 5.54 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.54 5.54 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.14 3.14 0 0 1 1.1-.8A5.73 5.73 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.61 5.61 0 0 1 1.86.34a3.06 3.06 0 0 1 1.19.8a3.06 3.06 0 0 1 .75 1.1a5.61 5.61 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4ZM12 6.87A5.13 5.13 0 1 0 17.14 12A5.12 5.12 0 0 0 12 6.87Zm0 8.46A3.33 3.33 0 1 1 15.33 12A3.33 3.33 0 0 1 12 15.33Z"/></svg></a></li>
                    <li><a href="#" className="btn btn-outline-light"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M1.04 17.52q.1-.16.32-.02a21.308 21.308 0 0 0 10.88 2.9a21.524 21.524 0 0 0 7.74-1.46q.1-.04.29-.12t.27-.12a.356.356 0 0 1 .47.12q.17.24-.11.44q-.36.26-.92.6a14.99 14.99 0 0 1-3.84 1.58A16.175 16.175 0 0 1 12 22a16.017 16.017 0 0 1-5.9-1.09a16.246 16.246 0 0 1-4.98-3.07a.273.273 0 0 1-.12-.2a.215.215 0 0 1 .04-.12Zm6.02-5.7a4.036 4.036 0 0 1 .68-2.36A4.197 4.197 0 0 1 9.6 7.98a10.063 10.063 0 0 1 2.66-.66q.54-.06 1.76-.16v-.34a3.562 3.562 0 0 0-.28-1.72a1.5 1.5 0 0 0-1.32-.6h-.16a2.189 2.189 0 0 0-1.14.42a1.64 1.64 0 0 0-.62 1a.508.508 0 0 1-.4.46L7.8 6.1q-.34-.08-.34-.36a.587.587 0 0 1 .02-.14a3.834 3.834 0 0 1 1.67-2.64A6.268 6.268 0 0 1 12.26 2h.5a5.054 5.054 0 0 1 3.56 1.18a3.81 3.81 0 0 1 .37.43a3.875 3.875 0 0 1 .27.41a2.098 2.098 0 0 1 .18.52q.08.34.12.47a2.856 2.856 0 0 1 .06.56q.02.43.02.51v4.84a2.868 2.868 0 0 0 .15.95a2.475 2.475 0 0 0 .29.62q.14.19.46.61a.599.599 0 0 1 .12.32a.346.346 0 0 1-.16.28q-1.66 1.44-1.8 1.56a.557.557 0 0 1-.58.04q-.28-.24-.49-.46t-.3-.32a4.466 4.466 0 0 1-.29-.39q-.2-.29-.28-.39a4.91 4.91 0 0 1-2.2 1.52a6.038 6.038 0 0 1-1.68.2a3.505 3.505 0 0 1-2.53-.95a3.553 3.553 0 0 1-.99-2.69Zm3.44-.4a1.895 1.895 0 0 0 .39 1.25a1.294 1.294 0 0 0 1.05.47a1.022 1.022 0 0 0 .17-.02a1.022 1.022 0 0 1 .15-.02a2.033 2.033 0 0 0 1.3-1.08a3.13 3.13 0 0 0 .33-.83a3.8 3.8 0 0 0 .12-.73q.01-.28.01-.92v-.5a7.287 7.287 0 0 0-1.76.16a2.144 2.144 0 0 0-1.76 2.22Zm8.4 6.44a.626.626 0 0 1 .12-.16a3.14 3.14 0 0 1 .96-.46a6.52 6.52 0 0 1 1.48-.22a1.195 1.195 0 0 1 .38.02q.9.08 1.08.3a.655.655 0 0 1 .08.36v.14a4.56 4.56 0 0 1-.38 1.65a3.84 3.84 0 0 1-1.06 1.53a.302.302 0 0 1-.18.08a.177.177 0 0 1-.08-.02q-.12-.06-.06-.22a7.632 7.632 0 0 0 .74-2.42a.513.513 0 0 0-.08-.32q-.2-.24-1.12-.24q-.34 0-.8.04q-.5.06-.92.12a.232.232 0 0 1-.16-.04a.065.065 0 0 1-.02-.08a.153.153 0 0 1 .02-.06Z"/></svg></a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-6">
              <div className="footer-menu">
                <h5 className="widget-title">Ultras</h5>
                <ul className="menu-list list-unstyled">
                  <li className="menu-item"><a href="#" className="nav-link">About us</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Conditions </a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Our Journals</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Careers</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Affiliate Programme</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Ultras Press</a></li>
                </ul>
              </div>
            </div>
            <div className="col-md-2 col-sm-6">
              <div className="footer-menu">
                <h5 className="widget-title">Customer Service</h5>
                <ul className="menu-list list-unstyled">
                  <li className="menu-item"><a href="#" className="nav-link">FAQ</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Contact</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Privacy Policy</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Returns & Refunds</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Cookie Guidelines</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Delivery Information</a></li>
                </ul>
              </div>
            </div>
            <div className="col-md-2 col-sm-6">
              <div className="footer-menu">
                <h5 className="widget-title">Customer Service</h5>
                <ul className="menu-list list-unstyled">
                  <li className="menu-item"><a href="#" className="nav-link">FAQ</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Contact</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Privacy Policy</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Returns & Refunds</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Cookie Guidelines</a></li>
                  <li className="menu-item"><a href="#" className="nav-link">Delivery Information</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-menu">
                <h5 className="widget-title">Subscribe Us</h5>
                <p>Subscribe to our newsletter to get updates about our grand offers.</p>
                <form className="d-flex mt-3 gap-0" role="newsletter">
                  <input className="form-control rounded-start rounded-0 bg-light" type="email" placeholder="Email Address" aria-label="Email Address" />
                  <button className="btn btn-dark rounded-end rounded-0" type="submit">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div id="footer-bottom">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 copyright">
              <p>&copy; 2025 Shanthi Stores. All rights reserved.</p>
            </div>
            <div className="col-md-6 credit-link text-start text-md-end">

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
