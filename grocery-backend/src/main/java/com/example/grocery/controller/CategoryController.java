package com.example.grocery.controller;

import com.example.grocery.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * CategoryController - Unified API for all product categories
 * Provides endpoints to get all categories and products by category
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private BakeryRepository bakeryRepo;
    
    @Autowired
    private FruitsRepository fruitsRepo;
    
    @Autowired
    private DairyRepository dairyRepo;
    
    @Autowired
    private MeatRepository meatRepo;
    
    @Autowired
    private BeveragesRepository beveragesRepo;
    
    @Autowired
    private GrainsRepository grainsRepo;
    
    @Autowired
    private VegetablesRepository vegetablesRepo;
    
    @Autowired
    private ProductRepository productRepo;

    /**
     * GET /api/categories
     * Get list of all available categories
     */
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            List<Map<String, Object>> categories = new ArrayList<>();
            
            // Bakery
            categories.add(Map.of(
                "id", 1,
                "name", "Bakery",
                "endpoint", "/api/bakery",
                "count", bakeryRepo.count(),
                "icon", "🥖",
                "description", "Fresh bread, cakes, and baked goods"
            ));
            
            // Fruits
            categories.add(Map.of(
                "id", 2,
                "name", "Fruits",
                "endpoint", "/api/fruits",
                "count", fruitsRepo.count(),
                "icon", "🍎",
                "description", "Fresh seasonal fruits"
            ));
            
            // Dairy
            categories.add(Map.of(
                "id", 3,
                "name", "Dairy",
                "endpoint", "/api/dairy",
                "count", dairyRepo.count(),
                "icon", "🥛",
                "description", "Milk, cheese, yogurt, and dairy products"
            ));
            
            // Meat
            categories.add(Map.of(
                "id", 4,
                "name", "Meat",
                "endpoint", "/api/meat",
                "count", meatRepo.count(),
                "icon", "🥩",
                "description", "Fresh meat and poultry"
            ));
            
            // Beverages
            categories.add(Map.of(
                "id", 5,
                "name", "Beverages",
                "endpoint", "/api/beverages",
                "count", beveragesRepo.count(),
                "icon", "🥤",
                "description", "Soft drinks, juices, and beverages"
            ));
            
            // Grains
            categories.add(Map.of(
                "id", 6,
                "name", "Grains",
                "endpoint", "/api/grains",
                "count", grainsRepo.count(),
                "icon", "🌾",
                "description", "Rice, wheat, and grain products"
            ));
            
            // Vegetables
            categories.add(Map.of(
                "id", 7,
                "name", "Vegetables",
                "endpoint", "/api/vegetables",
                "count", vegetablesRepo.count(),
                "icon", "🥬",
                "description", "Fresh vegetables"
            ));
            
            // General Products
            categories.add(Map.of(
                "id", 8,
                "name", "Products",
                "endpoint", "/api/products",
                "count", productRepo.count(),
                "icon", "🛒",
                "description", "General grocery products"
            ));
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "totalCategories", categories.size(),
                "categories", categories
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to fetch categories: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /api/categories/{categoryName}
     * Get all products from a specific category
     * 
     * @param categoryName - bakery, fruits, dairy, meat, beverages, grains, products
     */
    @GetMapping("/{categoryName}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String categoryName) {
        try {
            String category = categoryName.toLowerCase();
            List<?> products;
            
            switch (category) {
                case "bakery":
                    products = bakeryRepo.findAll();
                    break;
                case "fruits":
                    products = fruitsRepo.findAll();
                    break;
                case "dairy":
                    products = dairyRepo.findAll();
                    break;
                case "meat":
                    products = meatRepo.findAll();
                    break;
                case "beverages":
                    products = beveragesRepo.findAll();
                    break;
                case "grains":
                    products = grainsRepo.findAll();
                    break;
                case "vegetables":
                    products = vegetablesRepo.findAll();
                    break;
                case "products":
                    products = productRepo.findAll();
                    break;
                default:
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid category. Valid categories: bakery, fruits, dairy, meat, beverages, grains, vegetables, products"
                    ));
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "category", categoryName,
                "count", products.size(),
                "products", products
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to fetch products: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /api/categories/all-products
     * Get all products from all categories combined
     */
    @GetMapping("/all-products")
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Map<String, Object>> allProducts = new ArrayList<>();
            
            // Add products from each category with category label
            bakeryRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Bakery", "🥖"))
            );
            
            fruitsRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Fruits", "🍎"))
            );
            
            dairyRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Dairy", "🥛"))
            );
            
            meatRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Meat", "🥩"))
            );
            
            beveragesRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Beverages", "🥤"))
            );
            
            grainsRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Grains", "🌾"))
            );
            
            vegetablesRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Vegetables", "🥬"))
            );
            
            productRepo.findAll().forEach(item -> 
                allProducts.add(createProductMap(item, "Products", "🛒"))
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "totalProducts", allProducts.size(),
                "products", allProducts
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to fetch all products: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /api/categories/search?q={query}
     * Search products across all categories
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String q) {
        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Search query is required"
                ));
            }
            
            String query = q.toLowerCase();
            List<Map<String, Object>> results = new ArrayList<>();
            
            // Search in each category
            bakeryRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Bakery", "🥖")));
            
            fruitsRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Fruits", "🍎")));
            
            dairyRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Dairy", "🥛")));
            
            meatRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Meat", "🥩")));
            
            beveragesRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Beverages", "🥤")));
            
            grainsRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Grains", "🌾")));
            
            vegetablesRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Vegetables", "🥬")));
            
            productRepo.findAll().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Products", "🛒")));
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "query", q,
                "count", results.size(),
                "results", results
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Search failed: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /api/categories/stats
     * Get statistics about all categories
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getCategoryStats() {
        try {
            long totalProducts = bakeryRepo.count() + fruitsRepo.count() + 
                                dairyRepo.count() + meatRepo.count() + 
                                beveragesRepo.count() + grainsRepo.count() + 
                                vegetablesRepo.count() + productRepo.count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCategories", 8);
            stats.put("totalProducts", totalProducts);
            stats.put("breakdown", Map.of(
                "Bakery", bakeryRepo.count(),
                "Fruits", fruitsRepo.count(),
                "Dairy", dairyRepo.count(),
                "Meat", meatRepo.count(),
                "Beverages", beveragesRepo.count(),
                "Grains", grainsRepo.count(),
                "Vegetables", vegetablesRepo.count(),
                "Products", productRepo.count()
            ));
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "stats", stats
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to fetch stats: " + e.getMessage()
            ));
        }
    }

    // Helper method to create product map with category info
    private Map<String, Object> createProductMap(Object item, String category, String icon) {
        Map<String, Object> map = new HashMap<>();
        try {
            // Use reflection to get common fields (id, name, price, description, quantity, image)
            java.lang.reflect.Method getId = item.getClass().getMethod("getId");
            java.lang.reflect.Method getName = item.getClass().getMethod("getName");
            java.lang.reflect.Method getPrice = item.getClass().getMethod("getPrice");
            java.lang.reflect.Method getDescription = item.getClass().getMethod("getDescription");
            java.lang.reflect.Method getQuantity = item.getClass().getMethod("getQuantity");
            java.lang.reflect.Method getImage = item.getClass().getMethod("getImage");
            
            map.put("id", getId.invoke(item));
            map.put("name", getName.invoke(item));
            map.put("price", getPrice.invoke(item));
            map.put("description", getDescription.invoke(item));
            map.put("quantity", getQuantity.invoke(item));
            map.put("image", getImage.invoke(item));
            map.put("category", category);
            map.put("categoryIcon", icon);
            
        } catch (Exception e) {
            // Fallback: just return the object as-is
            map.put("item", item);
            map.put("category", category);
            map.put("categoryIcon", icon);
        }
        return map;
    }

    // Helper method to check if an item matches search query
    private boolean matchesSearch(Object item, String query) {
        try {
            java.lang.reflect.Method getName = item.getClass().getMethod("getName");
            java.lang.reflect.Method getDescription = item.getClass().getMethod("getDescription");
            
            String name = (String) getName.invoke(item);
            String description = (String) getDescription.invoke(item);
            
            return (name != null && name.toLowerCase().contains(query)) ||
                   (description != null && description.toLowerCase().contains(query));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * PUT /api/categories/products/{id}
     * Update a product in its category-specific table
     * Requires category field in request body to know which table to update
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProductInCategory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> productData,
            @RequestHeader("user-id") Long userId) {
        try {
            System.out.println("[CategoryController] ===== UPDATE PRODUCT REQUEST =====");
            System.out.println("[CategoryController] Product ID: " + id);
            System.out.println("[CategoryController] User ID: " + userId);
            System.out.println("[CategoryController] Product Data: " + productData);
            
            // Get category from request
            String category = (String) productData.get("category");
            if (category == null || category.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Category is required in request body"
                ));
            }
            
            category = category.toLowerCase();
            System.out.println("[CategoryController] Target category: " + category);
            
            // Extract product fields
            String name = (String) productData.get("name");
            String description = (String) productData.get("description");
            Double price = productData.get("price") instanceof Number ? 
                          ((Number) productData.get("price")).doubleValue() : null;
            Integer quantity = productData.get("quantity") instanceof Number ? 
                             ((Number) productData.get("quantity")).intValue() : null;
            String image = (String) productData.get("image");
            
            if (name == null || price == null || quantity == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "name, price, and quantity are required"
                ));
            }
            
            Object updatedProduct = null;
            
            // Update in the appropriate category-specific table
            switch (category) {
                case "bakery":
                    com.example.grocery.model.Bakery bakery = bakeryRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Bakery product not found with id: " + id));
                    bakery.setName(name);
                    bakery.setDescription(description);
                    bakery.setPrice(price);
                    bakery.setQuantity(quantity);
                    if (image != null) bakery.setImage(image);
                    updatedProduct = bakeryRepo.save(bakery);
                    System.out.println("[CategoryController] ✅ Updated in bakery table");
                    break;
                    
                case "fruits":
                    com.example.grocery.model.Fruits fruits = fruitsRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Fruits product not found with id: " + id));
                    fruits.setName(name);
                    fruits.setDescription(description);
                    fruits.setPrice(price);
                    fruits.setQuantity(quantity);
                    if (image != null) fruits.setImage(image);
                    updatedProduct = fruitsRepo.save(fruits);
                    System.out.println("[CategoryController] ✅ Updated in fruits table");
                    break;
                    
                case "dairy":
                    com.example.grocery.model.Dairy dairy = dairyRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Dairy product not found with id: " + id));
                    dairy.setName(name);
                    dairy.setDescription(description);
                    dairy.setPrice(price);
                    dairy.setQuantity(quantity);
                    if (image != null) dairy.setImage(image);
                    updatedProduct = dairyRepo.save(dairy);
                    System.out.println("[CategoryController] ✅ Updated in dairy table");
                    break;
                    
                case "meat":
                    com.example.grocery.model.Meat meat = meatRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Meat product not found with id: " + id));
                    meat.setName(name);
                    meat.setDescription(description);
                    meat.setPrice(price);
                    meat.setQuantity(quantity);
                    if (image != null) meat.setImage(image);
                    updatedProduct = meatRepo.save(meat);
                    System.out.println("[CategoryController] ✅ Updated in meat table");
                    break;
                    
                case "beverages":
                    com.example.grocery.model.Beverages beverages = beveragesRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Beverages product not found with id: " + id));
                    beverages.setName(name);
                    beverages.setDescription(description);
                    beverages.setPrice(price);
                    beverages.setQuantity(quantity);
                    if (image != null) beverages.setImage(image);
                    updatedProduct = beveragesRepo.save(beverages);
                    System.out.println("[CategoryController] ✅ Updated in beverages table");
                    break;
                    
                case "grains":
                    com.example.grocery.model.Grains grains = grainsRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Grains product not found with id: " + id));
                    grains.setName(name);
                    grains.setDescription(description);
                    grains.setPrice(price);
                    grains.setQuantity(quantity);
                    if (image != null) grains.setImage(image);
                    updatedProduct = grainsRepo.save(grains);
                    System.out.println("[CategoryController] ✅ Updated in grains table");
                    break;
                    
                case "vegetables":
                    com.example.grocery.model.Vegetables vegetables = vegetablesRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Vegetables product not found with id: " + id));
                    vegetables.setName(name);
                    vegetables.setDescription(description);
                    vegetables.setPrice(price);
                    vegetables.setQuantity(quantity);
                    if (image != null) vegetables.setImage(image);
                    updatedProduct = vegetablesRepo.save(vegetables);
                    System.out.println("[CategoryController] ✅ Updated in vegetables table");
                    break;
                    
                case "products":
                    com.example.grocery.model.Product product = productRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
                    product.setName(name);
                    product.setDescription(description);
                    product.setPrice(price);
                    product.setQuantity(quantity);
                    if (image != null) product.setImage(image);
                    updatedProduct = productRepo.save(product);
                    System.out.println("[CategoryController] ✅ Updated in products table");
                    break;
                    
                default:
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid category: " + category + ". Valid categories: bakery, fruits, dairy, meat, beverages, grains, vegetables, products"
                    ));
            }
            
            System.out.println("[CategoryController] ===== UPDATE SUCCESSFUL =====");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product updated successfully in " + category + " category",
                "product", updatedProduct
            ));
            
        } catch (Exception e) {
            System.err.println("[CategoryController] ❌ Update failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to update product: " + e.getMessage()
            ));
        }
    }
}
