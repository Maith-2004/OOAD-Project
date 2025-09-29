Grocery Backend (Spring Boot)
-----------------------------
- Java 17, Spring Boot, Maven
- MySQL database (configure in src/main/resources/application.properties)
- Default MySQL username: root
- Default MySQL password: Malith
- Important endpoints:
  - POST /api/auth/register  {username,password,role} 
  - POST /api/auth/login     {username,password}
  - GET  /api/products
  - POST /api/products
  - POST /api/orders         {customerId, total}
- To build and run:
  1. Ensure MySQL is running and create database: CREATE DATABASE grocerydb;
  2. mvn clean package
  3. java -jar target/grocery-backend-0.0.1-SNAPSHOT.jar
