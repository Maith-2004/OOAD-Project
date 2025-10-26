import React, { useState } from 'react';

function ProductCard({product, addToCart}){
  const [qty, setQty] = useState(1);
  return (
    <div style={{border:'1px solid #ccc',padding:10, borderRadius: 8}}>
      {/* Product Image */}
      {product.image && (
        <div style={{
          width: '100%',
          height: 200,
          marginBottom: 12,
          overflow: 'hidden',
          borderRadius: 8,
          background: '#f5f5f5'
        }}>
          <img 
            src={product.image} 
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none'; // Hide if image fails to load
            }}
          />
        </div>
      )}
      
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>Rs. {product.price}</p>
      <div style={{marginBottom:8}}>
        <label>Quantity: </label>
        <input type="number" min={1} max={product.quantity} value={qty} onChange={e=>setQty(Math.max(1,Math.min(product.quantity,parseInt(e.target.value)||1)))} style={{width:60}} />
      </div>
      <button onClick={()=>addToCart({...product, cartQty: qty})}>Add to cart</button>
    </div>
  );
}

export default ProductCard;
