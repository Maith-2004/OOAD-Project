// services/categoryService.js

import { CATEGORIES } from '../config/categories';

const API_BASE_URL = 'http://localhost:8081';

class CategoryService {
  // Get all products from a specific category
  async getProductsByCategory(categoryName) {
    const category = CATEGORIES[categoryName];
    if (!category) {
      throw new Error(`Invalid category: ${categoryName}`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${category.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${category.displayName}`);
      }

      const products = await response.json();
      return products.map((product) => ({
        ...product,
        category: categoryName
      }));
    } catch (error) {
      console.error(`Error fetching ${category.displayName}:`, error);
      throw error;
    }
  }

  // Get all products from all categories
  async getAllProducts() {
    const allProducts = [];
    
    for (const categoryName of Object.keys(CATEGORIES)) {
      try {
        const products = await this.getProductsByCategory(categoryName);
        allProducts.push(...products);
      } catch (error) {
        console.error(`Failed to fetch products from ${categoryName}:`, error);
      }
    }
    
    return allProducts;
  }

  // Create a new product in a specific category (Manager only)
  async createProduct(categoryName, productData) {
    const category = CATEGORIES[categoryName];
    if (!category) {
      throw new Error(`Invalid category: ${categoryName}`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${category.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': localStorage.getItem('userId') || ''
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create product in ${category.displayName}`);
      }

      const result = await response.json();
      
      // Check if response is an error
      if (result.error) {
        return result;
      }

      return {
        ...result,
        category: categoryName
      };
    } catch (error) {
      console.error(`Error creating product in ${category.displayName}:`, error);
      throw error;
    }
  }

  // Update a product in a specific category (Manager only)
  async updateProduct(categoryName, productId, productData) {
    const category = CATEGORIES[categoryName];
    if (!category) {
      throw new Error(`Invalid category: ${categoryName}`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${category.endpoint}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': localStorage.getItem('userId') || ''
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update product in ${category.displayName}`);
      }

      const result = await response.json();
      
      if (result.error) {
        return result;
      }

      return {
        ...result,
        category: categoryName
      };
    } catch (error) {
      console.error(`Error updating product in ${category.displayName}:`, error);
      throw error;
    }
  }

  // Delete a product from a specific category (Manager only)
  async deleteProduct(categoryName, productId) {
    const category = CATEGORIES[categoryName];
    if (!category) {
      throw new Error(`Invalid category: ${categoryName}`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${category.endpoint}/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-id': localStorage.getItem('userId') || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete product from ${category.displayName}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error deleting product from ${category.displayName}:`, error);
      throw error;
    }
  }

  // Get a single product by ID from a specific category
  async getProductById(categoryName, productId) {
    const category = CATEGORIES[categoryName];
    if (!category) {
      throw new Error(`Invalid category: ${categoryName}`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${category.endpoint}/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch product from ${category.displayName}`);
      }

      const product = await response.json();
      return {
        ...product,
        category: categoryName
      };
    } catch (error) {
      console.error(`Error fetching product from ${category.displayName}:`, error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();