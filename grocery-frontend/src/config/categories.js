// config/categories.js

export const CATEGORIES = {
  general: {
    name: 'general',
    displayName: 'General Products',
    icon: '🛒',
    description: 'Household items, cleaning supplies, batteries, etc.',
    endpoint: '/api/products',
    color: '#6c757d'
  },
  bakery: {
    name: 'bakery',
    displayName: 'Bakery',
    icon: '🥖',
    description: 'Fresh bread, pastries, cakes, and baked goods',
    endpoint: '/api/bakery',
    color: '#d4a574'
  },
  fruits: {
    name: 'fruits',
    displayName: 'Fruits',
    icon: '🍎',
    description: 'Fresh seasonal fruits and organic produce',
    endpoint: '/api/fruits',
    color: '#ff6b6b'
  },
  dairy: {
    name: 'dairy',
    displayName: 'Dairy',
    icon: '🥛',
    description: 'Milk, cheese, yogurt, and dairy products',
    endpoint: '/api/dairy',
    color: '#74c0fc'
  },
  meat: {
    name: 'meat',
    displayName: 'Meat',
    icon: '🥩',
    description: 'Fresh meat, poultry, and protein products',
    endpoint: '/api/meat',
    color: '#ff8787'
  },
  beverages: {
    name: 'beverages',
    displayName: 'Beverages',
    icon: '🥤',
    description: 'Juices, sodas, water, and refreshing drinks',
    endpoint: '/api/beverages',
    color: '#51cf66'
  },
  grains: {
    name: 'grains',
    displayName: 'Grains & Cereals',
    icon: '🌾',
    description: 'Rice, wheat, quinoa, and grain products',
    endpoint: '/api/grains',
    color: '#ffd43b'
  },
  vegetables: {
    name: 'vegetables',
    displayName: 'Vegetables',
    icon: '🥕',
    description: 'Fresh vegetables and organic greens',
    endpoint: '/api/vegetables',
    color: '#69db7c'
  }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);