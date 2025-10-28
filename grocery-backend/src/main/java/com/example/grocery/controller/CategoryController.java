package com.example.grocery.controller;

import com.example.grocery.model.User;
import com.example.grocery.model.Employee;
import com.example.grocery.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private EmployeeRepository employeeRepo;

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
                "count", bakeryRepo.countByActiveTrue(),
                "icon", "🥖",
                "description", "Fresh bread, cakes, and baked goods"
            ));
            
            // Fruits
            categories.add(Map.of(
                "id", 2,
                "name", "Fruits",
                "endpoint", "/api/fruits",
                "count", fruitsRepo.countByActiveTrue(),
                "icon", "🍎",
                "description", "Fresh seasonal fruits"
            ));
            
            // Dairy
            categories.add(Map.of(
                "id", 3,
                "name", "Dairy",
                "endpoint", "/api/dairy",
                "count", dairyRepo.countByActiveTrue(),
                "icon", "🥛",
                "description", "Milk, cheese, yogurt, and dairy products"
            ));
            
            // Meat
            categories.add(Map.of(
                "id", 4,
                "name", "Meat",
                "endpoint", "/api/meat",
                "count", meatRepo.countByActiveTrue(),
                "icon", "🥩",
                "description", "Fresh meat and poultry"
            ));
            
            // Beverages
            categories.add(Map.of(
                "id", 5,
                "name", "Beverages",
                "endpoint", "/api/beverages",
                "count", beveragesRepo.countByActiveTrue(),
                "icon", "🥤",
                "description", "Soft drinks, juices, and beverages"
            ));
            
            // Grains
            categories.add(Map.of(
                "id", 6,
                "name", "Grains",
                "endpoint", "/api/grains",
                "count", grainsRepo.countByActiveTrue(),
                "icon", "🌾",
                "description", "Rice, wheat, and grain products"
            ));
            
            // Vegetables
            categories.add(Map.of(
                "id", 7,
                "name", "Vegetables",
                "endpoint", "/api/vegetables",
                "count", vegetablesRepo.countByActiveTrue(),
                "icon", "🥬",
                "description", "Fresh vegetables"
            ));
            
            // General Products
            categories.add(Map.of(
                "id", 8,
                "name", "Products",
                "endpoint", "/api/products",
                "count", productRepo.countByActiveTrue(),
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
            
            // Add products from each category with category label - ONLY ACTIVE PRODUCTS
            bakeryRepo.findByActiveTrue().forEach(item -> 
                allProducts.add(createProductMap(item, "Bakery", "🥖"))
            );
            
            fruitsRepo.findByActiveTrue().forEach(item -> 
                allProducts.add(createProductMap(item, "Fruits", "🍎"))
            );
            
            dairyRepo.findByActiveTrue().forEach(item -> 
                allProducts.add(createProductMap(item, "Dairy", "🥛"))
            );
            
            meatRepo.findByActiveTrue().forEach(item -> 
                allProducts.add(createProductMap(item, "Meat", "🥩"))
            );
            
            beveragesRepo.findByActiveTrue().forEach(item -> 
                allProducts.add(createProductMap(item, "Beverages", "🥤"))
            );
            
            grainsRepo.findByActiveTrue().forEach(item -> 
                allProducts.add(createProductMap(item, "Grains", "🌾"))
            );
            
            vegetablesRepo.findByActiveTrue().forEach(item -> 
                allProducts.add(createProductMap(item, "Vegetables", "🥬"))
            );
            
            productRepo.findByActiveTrue().forEach(item -> 
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
            
            // Search in each category - ONLY ACTIVE PRODUCTS
            bakeryRepo.findByActiveTrue().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Bakery", "🥖")));
            
            fruitsRepo.findByActiveTrue().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Fruits", "🍎")));
            
            dairyRepo.findByActiveTrue().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Dairy", "🥛")));
            
            meatRepo.findByActiveTrue().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Meat", "🥩")));
            
            beveragesRepo.findByActiveTrue().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Beverages", "🥤")));
            
            grainsRepo.findByActiveTrue().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Grains", "🌾")));
            
            vegetablesRepo.findByActiveTrue().stream()
                .filter(item -> matchesSearch(item, query))
                .forEach(item -> results.add(createProductMap(item, "Vegetables", "🥬")));
            
            productRepo.findByActiveTrue().stream()
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
            map.put("category", category.toLowerCase());  // Lowercase for API consistency
            map.put("categoryIcon", icon);
            
        } catch (Exception e) {
            // Fallback: just return the object as-is
            map.put("item", item);
            map.put("category", category.toLowerCase());
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
     * Requires category (new) and oldCategory fields in request body
     * If category changes, moves product from old table to new table
     */
    @Transactional
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProductInCategory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> productData,
            @RequestHeader("user-id") Long userId) {
        try {
            // Check authorization first
            ResponseEntity<?> authCheck = checkAuthorization(userId);
            if (authCheck != null) {
                return authCheck; // Return error response
            }
            
            System.out.println("[CategoryController] ===== UPDATE PRODUCT REQUEST =====");
            System.out.println("[CategoryController] Product ID: " + id);
            System.out.println("[CategoryController] User ID: " + userId);
            System.out.println("[CategoryController] Product Data: " + productData);
            
            // Get new category from request
            String newCategory = (String) productData.get("category");
            String oldCategory = (String) productData.get("oldCategory");
            
            if (newCategory == null || newCategory.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Category is required in request body"
                ));
            }
            
            newCategory = newCategory.toLowerCase();
            
            // If oldCategory is not provided, try to find which table the product currently exists in
            if (oldCategory == null || oldCategory.trim().isEmpty()) {
                System.out.println("[CategoryController] ⚠️ oldCategory not provided, searching for product in all tables...");
                oldCategory = findProductCategory(id);
                if (oldCategory == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Product with id " + id + " not found in any category table"
                    ));
                }
                System.out.println("[CategoryController] ✅ Found product in: " + oldCategory);
            } else {
                oldCategory = oldCategory.toLowerCase();
            }
            
            System.out.println("[CategoryController] Old category: " + oldCategory);
            System.out.println("[CategoryController] New category: " + newCategory);
            
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
            boolean categoryChanged = !oldCategory.equals(newCategory);
            
            if (categoryChanged) {
                System.out.println("[CategoryController] ⚠️ CATEGORY CHANGE DETECTED: " + oldCategory + " -> " + newCategory);
                
                // Step 1: Verify product exists in old category
                if (!productExistsInCategory(id, oldCategory)) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Product with id " + id + " not found in " + oldCategory + " table"
                    ));
                }
                
                // Step 2: Delete from old category table
                deleteFromCategory(id, oldCategory);
                System.out.println("[CategoryController] ✅ Deleted from " + oldCategory + " table (ID: " + id + ")");
                
                // Step 3: Verify deletion
                if (productExistsInCategory(id, oldCategory)) {
                    throw new RuntimeException("Failed to delete product from " + oldCategory + " table");
                }
                
                // Step 4: Create in new category table
                updatedProduct = createInCategory(name, description, price, quantity, image, newCategory);
                System.out.println("[CategoryController] ✅ Created in " + newCategory + " table with new ID");
                
            } else {
                System.out.println("[CategoryController] ℹ️ No category change, updating in place");
                
                // Update in the same category table
                updatedProduct = updateInCategory(id, name, description, price, quantity, image, newCategory);
                System.out.println("[CategoryController] ✅ Updated in " + newCategory + " table");
            }
            
            System.out.println("[CategoryController] ===== UPDATE SUCCESSFUL =====");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", categoryChanged ? 
                    "Product moved from " + oldCategory + " to " + newCategory + " successfully" :
                    "Product updated successfully in " + newCategory + " category",
                "product", updatedProduct
            ));
            
        } catch (Exception e) {
            System.err.println("[CategoryController] ❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to update product: " + e.getMessage()
            ));
        }
    }
    
    /**
     * DELETE /api/categories/products/{id}
     * Delete a product from any category table
     * Automatically finds which table the product is in and deletes it
     */
    @Transactional
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProductFromCategory(
            @PathVariable Long id,
            @RequestHeader("user-id") Long userId) {
        try {
            // Check authorization first
            ResponseEntity<?> authCheck = checkAuthorization(userId);
            if (authCheck != null) {
                return authCheck; // Return error response
            }
            
            System.out.println("[CategoryController] ===== DELETE PRODUCT REQUEST =====");
            System.out.println("[CategoryController] Product ID: " + id);
            System.out.println("[CategoryController] User ID: " + userId);
            
            // Find which category the product belongs to
            String category = findProductCategory(id);
            
            if (category == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Product with id " + id + " not found in any category table"
                ));
            }
            
            System.out.println("[CategoryController] Found product in: " + category);
            
            // Soft delete from the category table
            deleteFromCategory(id, category);
            System.out.println("[CategoryController] ✅ Soft deleted product from " + category + " table");
            
            // Verify soft deletion (product should now be inactive)
            if (productExistsInCategory(id, category)) {
                throw new RuntimeException("Failed to soft delete product from " + category + " table");
            }
            
            System.out.println("[CategoryController] ===== SOFT DELETE SUCCESSFUL =====");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product marked as inactive in " + category + " category",
                "deletedId", id,
                "category", category
            ));
            
        } catch (Exception e) {
            System.err.println("[CategoryController] ❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to delete product: " + e.getMessage()
            ));
        }
    }
    
    // Helper method to check if user has manager or worker role
    private ResponseEntity<?> checkAuthorization(Long userId) {
        // Check users table first
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole();
            if (!"manager".equalsIgnoreCase(role) && 
                !"worker".equalsIgnoreCase(role) && 
                !"worker employee".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "Only manager or worker can perform this action"
                ));
            }
            return null; // Authorized
        }
        
        // Check employees table
        Optional<Employee> empOpt = employeeRepo.findById(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String role = emp.getRole();
            if (!"manager".equalsIgnoreCase(role) && 
                !"worker".equalsIgnoreCase(role) && 
                !"worker employee".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "Only manager or worker can perform this action"
                ));
            }
            return null; // Authorized
        }
        
        // User not found in either table
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
            "success", false,
            "error", "User not found"
        ));
    }
    
    // Helper method to find which category table a product exists in
    private String findProductCategory(Long id) {
        if (bakeryRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "bakery";
        if (fruitsRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "fruits";
        if (dairyRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "dairy";
        if (meatRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "meat";
        if (beveragesRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "beverages";
        if (grainsRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "grains";
        if (vegetablesRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "vegetables";
        if (productRepo.findById(id).map(item -> item.isActive()).orElse(false)) return "products";
        return null; // Product not found in any table or inactive
    }
    
    // Helper method to check if product exists in a specific category
    private boolean productExistsInCategory(Long id, String category) {
        switch (category.toLowerCase()) {
            case "bakery": 
                return bakeryRepo.findById(id).map(item -> item.isActive()).orElse(false);
            case "fruits": 
                return fruitsRepo.findById(id).map(item -> item.isActive()).orElse(false);
            case "dairy": 
                return dairyRepo.findById(id).map(item -> item.isActive()).orElse(false);
            case "meat": 
                return meatRepo.findById(id).map(item -> item.isActive()).orElse(false);
            case "beverages": 
                return beveragesRepo.findById(id).map(item -> item.isActive()).orElse(false);
            case "grains": 
                return grainsRepo.findById(id).map(item -> item.isActive()).orElse(false);
            case "vegetables": 
                return vegetablesRepo.findById(id).map(item -> item.isActive()).orElse(false);
            case "products": 
                return productRepo.findById(id).map(item -> item.isActive()).orElse(false);
            default: return false;
        }
    }
    
    // Helper method to delete product from a category table
    private void deleteFromCategory(Long id, String category) {
        switch (category) {
            case "bakery":
                bakeryRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    bakeryRepo.save(item);
                });
                break;
            case "fruits":
                fruitsRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    fruitsRepo.save(item);
                });
                break;
            case "dairy":
                dairyRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    dairyRepo.save(item);
                });
                break;
            case "meat":
                meatRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    meatRepo.save(item);
                });
                break;
            case "beverages":
                beveragesRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    beveragesRepo.save(item);
                });
                break;
            case "grains":
                grainsRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    grainsRepo.save(item);
                });
                break;
            case "vegetables":
                vegetablesRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    vegetablesRepo.save(item);
                });
                break;
            case "products":
                productRepo.findById(id).ifPresent(item -> {
                    item.setActive(false);
                    productRepo.save(item);
                });
                break;
            default:
                throw new RuntimeException("Invalid category for deletion: " + category);
        }
    }
    
    // Helper method to create product in a new category table
    private Object createInCategory(String name, String description, Double price, Integer quantity, String image, String category) {
        switch (category) {
            case "bakery":
                com.example.grocery.model.Bakery bakery = new com.example.grocery.model.Bakery();
                bakery.setName(name);
                bakery.setDescription(description);
                bakery.setPrice(price);
                bakery.setQuantity(quantity);
                if (image != null) bakery.setImage(image);
                return bakeryRepo.save(bakery);
                
            case "fruits":
                com.example.grocery.model.Fruits fruits = new com.example.grocery.model.Fruits();
                fruits.setName(name);
                fruits.setDescription(description);
                fruits.setPrice(price);
                fruits.setQuantity(quantity);
                if (image != null) fruits.setImage(image);
                return fruitsRepo.save(fruits);
                
            case "dairy":
                com.example.grocery.model.Dairy dairy = new com.example.grocery.model.Dairy();
                dairy.setName(name);
                dairy.setDescription(description);
                dairy.setPrice(price);
                dairy.setQuantity(quantity);
                if (image != null) dairy.setImage(image);
                return dairyRepo.save(dairy);
                
            case "meat":
                com.example.grocery.model.Meat meat = new com.example.grocery.model.Meat();
                meat.setName(name);
                meat.setDescription(description);
                meat.setPrice(price);
                meat.setQuantity(quantity);
                if (image != null) meat.setImage(image);
                return meatRepo.save(meat);
                
            case "beverages":
                com.example.grocery.model.Beverages beverages = new com.example.grocery.model.Beverages();
                beverages.setName(name);
                beverages.setDescription(description);
                beverages.setPrice(price);
                beverages.setQuantity(quantity);
                if (image != null) beverages.setImage(image);
                return beveragesRepo.save(beverages);
                
            case "grains":
                com.example.grocery.model.Grains grains = new com.example.grocery.model.Grains();
                grains.setName(name);
                grains.setDescription(description);
                grains.setPrice(price);
                grains.setQuantity(quantity);
                if (image != null) grains.setImage(image);
                return grainsRepo.save(grains);
                
            case "vegetables":
                com.example.grocery.model.Vegetables vegetables = new com.example.grocery.model.Vegetables();
                vegetables.setName(name);
                vegetables.setDescription(description);
                vegetables.setPrice(price);
                vegetables.setQuantity(quantity);
                if (image != null) vegetables.setImage(image);
                return vegetablesRepo.save(vegetables);
                
            case "products":
                com.example.grocery.model.Product product = new com.example.grocery.model.Product();
                product.setName(name);
                product.setDescription(description);
                product.setPrice(price);
                product.setQuantity(quantity);
                if (image != null) product.setImage(image);
                return productRepo.save(product);
                
            default:
                throw new RuntimeException("Invalid category for creation: " + category);
        }
    }
    
    // Helper method to update product in the same category table
    private Object updateInCategory(Long id, String name, String description, Double price, Integer quantity, String image, String category) {
        switch (category) {
            case "bakery":
                com.example.grocery.model.Bakery bakery = bakeryRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bakery product not found with id: " + id));
                bakery.setName(name);
                bakery.setDescription(description);
                bakery.setPrice(price);
                bakery.setQuantity(quantity);
                if (image != null) bakery.setImage(image);
                return bakeryRepo.save(bakery);
                    
            case "fruits":
                com.example.grocery.model.Fruits fruits = fruitsRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Fruits product not found with id: " + id));
                fruits.setName(name);
                fruits.setDescription(description);
                fruits.setPrice(price);
                fruits.setQuantity(quantity);
                if (image != null) fruits.setImage(image);
                return fruitsRepo.save(fruits);
                
            case "dairy":
                com.example.grocery.model.Dairy dairy = dairyRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Dairy product not found with id: " + id));
                dairy.setName(name);
                dairy.setDescription(description);
                dairy.setPrice(price);
                dairy.setQuantity(quantity);
                if (image != null) dairy.setImage(image);
                return dairyRepo.save(dairy);
                
            case "meat":
                com.example.grocery.model.Meat meat = meatRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Meat product not found with id: " + id));
                meat.setName(name);
                meat.setDescription(description);
                meat.setPrice(price);
                meat.setQuantity(quantity);
                if (image != null) meat.setImage(image);
                return meatRepo.save(meat);
                
            case "beverages":
                com.example.grocery.model.Beverages beverages = beveragesRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Beverages product not found with id: " + id));
                beverages.setName(name);
                beverages.setDescription(description);
                beverages.setPrice(price);
                beverages.setQuantity(quantity);
                if (image != null) beverages.setImage(image);
                return beveragesRepo.save(beverages);
                
            case "grains":
                com.example.grocery.model.Grains grains = grainsRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Grains product not found with id: " + id));
                grains.setName(name);
                grains.setDescription(description);
                grains.setPrice(price);
                grains.setQuantity(quantity);
                if (image != null) grains.setImage(image);
                return grainsRepo.save(grains);
                
            case "vegetables":
                com.example.grocery.model.Vegetables vegetables = vegetablesRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Vegetables product not found with id: " + id));
                vegetables.setName(name);
                vegetables.setDescription(description);
                vegetables.setPrice(price);
                vegetables.setQuantity(quantity);
                if (image != null) vegetables.setImage(image);
                return vegetablesRepo.save(vegetables);
                
            case "products":
                com.example.grocery.model.Product product = productRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
                product.setName(name);
                product.setDescription(description);
                product.setPrice(price);
                product.setQuantity(quantity);
                if (image != null) product.setImage(image);
                return productRepo.save(product);
                
            default:
                throw new RuntimeException("Invalid category for update: " + category);
        }
    }
}
