package com.example.grocery.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/database-info")
public class DatabaseInfoController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/tables/{tableName}/columns")
    public Map<String, Object> getTableColumns(@PathVariable String tableName) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, String>> columns = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getColumns(null, null, tableName, null);
            
            while (rs.next()) {
                Map<String, String> column = new HashMap<>();
                column.put("name", rs.getString("COLUMN_NAME"));
                column.put("type", rs.getString("TYPE_NAME"));
                column.put("size", rs.getString("COLUMN_SIZE"));
                column.put("nullable", rs.getString("IS_NULLABLE"));
                columns.add(column);
            }
            
            result.put("tableName", tableName);
            result.put("columns", columns);
            result.put("hasImageColumn", columns.stream()
                .anyMatch(col -> "image".equalsIgnoreCase(col.get("name"))));
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    @GetMapping("/check-all-tables")
    public Map<String, Object> checkAllCategoryTables() {
        Map<String, Object> result = new HashMap<>();
        String[] tables = {"product", "bakery", "fruits", "dairy", "meat", "beverages", "grains", "vegetables"};
        
        for (String table : tables) {
            Map<String, Object> tableInfo = getTableColumns(table);
            result.put(table, tableInfo.get("hasImageColumn"));
        }
        
        return result;
    }
}
