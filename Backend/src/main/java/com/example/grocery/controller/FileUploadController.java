package com.example.grocery.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

/**
 * FileUploadController
 * Handles payment receipt image uploads for bank payment orders
 * 
 * Endpoints:
 * - POST /api/files/upload - Upload receipt file
 * - GET /api/files/receipts/{filename} - Retrieve uploaded receipt
 * 
 * @author Grocery App Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/receipts/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};

    /**
     * Upload a payment receipt file
     * 
     * @param file MultipartFile - The receipt image file
     * @param customerId Long - Customer ID who is uploading
     * @return ResponseEntity with file metadata or error
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("receipt") MultipartFile file,
            @RequestParam("customerId") Long customerId) {
        
        try {
            System.out.println("[FileUpload] ═══════════════════════════════════");
            System.out.println("[FileUpload] Received upload request");
            System.out.println("[FileUpload] Customer ID: " + customerId);
            System.out.println("[FileUpload] File name: " + file.getOriginalFilename());
            System.out.println("[FileUpload] File size: " + file.getSize() + " bytes");
            
            // Validate file is not empty
            if (file.isEmpty()) {
                System.err.println("[FileUpload] ❌ Error: Empty file");
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Please select a file to upload"));
            }

            // Check file type (images only)
            String contentType = file.getContentType();
            System.out.println("[FileUpload] Content type: " + contentType);
            
            if (contentType == null || !isAllowedType(contentType)) {
                System.err.println("[FileUpload] ❌ Error: Invalid file type - " + contentType);
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Only image files are allowed (JPEG, PNG, GIF, WebP)"));
            }

            // Check file size (max 5MB)
            if (file.getSize() > MAX_FILE_SIZE) {
                System.err.println("[FileUpload] ❌ Error: File too large (" + file.getSize() + " bytes)");
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("File size must be less than 5MB. Current size: " + 
                            formatFileSize(file.getSize())));
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                System.out.println("[FileUpload] Creating upload directory: " + uploadPath.toAbsolutePath());
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String filename = "receipt_" + System.currentTimeMillis() + 
                            "_customer" + customerId + extension;
            
            Path filePath = uploadPath.resolve(filename);
            
            System.out.println("[FileUpload] Saving file to: " + filePath.toAbsolutePath());
            
            // Save file to disk
            Files.copy(file.getInputStream(), filePath, 
                      StandardCopyOption.REPLACE_EXISTING);

            System.out.println("[FileUpload] ✅ File uploaded successfully!");
            System.out.println("[FileUpload] Filename: " + filename);
            System.out.println("[FileUpload] Size: " + formatFileSize(file.getSize()));
            System.out.println("[FileUpload] ═══════════════════════════════════");

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("filename", filename);
            response.put("url", "/receipts/" + filename);
            response.put("size", file.getSize());
            response.put("sizeFormatted", formatFileSize(file.getSize()));
            response.put("message", "File uploaded successfully");
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            System.err.println("[FileUpload] ❌ IOException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(createErrorResponse("Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("[FileUpload] ❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(createErrorResponse("Unexpected error: " + e.getMessage()));
        }
    }

    /**
     * Retrieve an uploaded receipt file
     * 
     * @param filename String - The filename to retrieve
     * @return ResponseEntity with file bytes or error
     */
    @GetMapping("/receipts/{filename}")
    public ResponseEntity<?> getFile(@PathVariable String filename) {
        try {
            System.out.println("[FileUpload] Fetching receipt: " + filename);
            
            // Resolve file path
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
            
            // Check if file exists
            if (!Files.exists(filePath)) {
                System.err.println("[FileUpload] ❌ File not found: " + filename);
                return ResponseEntity.notFound().build();
            }
            
            // Read file bytes
            byte[] fileContent = Files.readAllBytes(filePath);
            
            // Determine content type based on file extension
            String contentType = determineContentType(filename);
            
            System.out.println("[FileUpload] ✅ Returning file: " + filename + 
                             " (" + formatFileSize(fileContent.length) + ")");
            
            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .header("Cache-Control", "max-age=3600")
                .body(fileContent);
                
        } catch (IOException e) {
            System.err.println("[FileUpload] ❌ Error reading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(createErrorResponse("Failed to read file: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to create error response map
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return error;
    }
    
    /**
     * Check if content type is allowed
     */
    private boolean isAllowedType(String contentType) {
        for (String type : ALLOWED_TYPES) {
            if (type.equals(contentType)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Determine content type from filename extension
     */
    private String determineContentType(String filename) {
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".png")) {
            return "image/png";
        } else if (lowerFilename.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "image/jpeg"; // default
        }
    }
    
    /**
     * Format file size in human-readable format
     */
    private String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.2f KB", size / 1024.0);
        } else {
            return String.format("%.2f MB", size / (1024.0 * 1024.0));
        }
    }
}
