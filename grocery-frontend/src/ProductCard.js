import React, { useState } from 'react';

function ProductCard({product, addToCart}){
  const [qty, setQty] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      style={{
        width: '240px',
        height: '360px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid #f0f0f0',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {product.discount && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'linear-gradient(135deg, #FFD54F, #FFCA28)',
          color: '#1a1a1a',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '800',
          zIndex: 2,
          boxShadow: '0 2px 8px rgba(255, 213, 79, 0.35)',
          letterSpacing: '0.3px'
        }}>
          -{product.discount}% OFF
        </div>
      )}

      {/* Favorite Button */}
      <button style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        zIndex: 2,
        transition: 'transform 0.2s'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Product Image - MAXIMUM SPACE */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '220px',
        marginBottom: '8px',
        borderRadius: '12px',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img 
          src={product.image || '/FoodMart-1.0.0/images/thumb-bananas.png'} 
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center'
          }}
          onError={(e) => {
            e.target.src = '/FoodMart-1.0.0/images/thumb-bananas.png';
          }}
        />
      </div>

      {/* Product Name */}
      <h3 style={{
        fontWeight: '600',
        fontSize: '15px',
        color: '#1a1a1a',
        margin: '0 0 4px 0',
        lineHeight: '1.2',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        letterSpacing: '-0.2px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical'
      }}>{product.name}</h3>

      {/* Product Description */}
      <p style={{
        fontSize: '11px',
        color: '#6b7280',
        margin: '0 0 4px 0',
        lineHeight: '1.3',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical'
      }}>{product.description || 'Fresh and high quality product'}</p>

      {/* Rating */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        margin: '0 0 4px 0'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '3px'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB400">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#1a1a1a',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>4.5</span>
        </div>
        <span style={{
          fontSize: '10px',
          color: '#9ca3af',
          fontWeight: '500',
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
        }}>• {product.quantity || 1} UNIT</span>
      </div>

      {/* Price */}
      <div style={{
        fontSize: '20px',
        fontWeight: '800',
        color: '#FFA726',
        margin: '0 0 8px 0',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        letterSpacing: '-0.5px'
      }}>
        <span style={{fontSize: '14px', fontWeight: '600'}}>Rs.</span> {product.price ? product.price.toFixed(2) : '0.00'}
      </div>

      {/* Quantity Selector & Add to Cart */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginTop: 'auto'
      }}>
        {/* Quantity Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '2px',
          border: '1.5px solid #e5e7eb'
        }}>
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1a1a1a',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
          >−</button>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1a1a1a',
            minWidth: '20px',
            textAlign: 'center',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>{qty}</span>
          <button 
            onClick={() => setQty(Math.min(product.quantity || 99, qty + 1))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1a1a1a',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
          >+</button>
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={() => addToCart({...product, cartQty: qty})}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #FFD54F, #FFCA28)',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(255, 213, 79, 0.3)',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            letterSpacing: '0.3px',
            transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
            boxShadow: isHovered ? '0 4px 12px rgba(255, 213, 79, 0.4)' : '0 2px 8px rgba(255, 213, 79, 0.3)'
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
