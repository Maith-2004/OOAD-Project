package com.example.grocery.controller;

import com.example.grocery.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

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
            // Use reflection to get common fields (id, name, price, description, quantity)
            java.lang.reflect.Method getId = item.getClass().getMethod("getId");
            java.lang.reflect.Method getName = item.getClass().getMethod("getName");
            java.lang.reflect.Method getPrice = item.getClass().getMethod("getPrice");
            java.lang.reflect.Method getDescription = item.getClass().getMethod("getDescription");
            java.lang.reflect.Method getQuantity = item.getClass().getMethod("getQuantity");
            
            map.put("id", getId.invoke(item));
            map.put("name", getName.invoke(item));
            map.put("price", getPrice.invoke(item));
            map.put("description", getDescription.invoke(item));
            map.put("quantity", getQuantity.invoke(item));
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
}
