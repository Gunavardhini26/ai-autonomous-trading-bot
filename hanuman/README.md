# Hanuman Microservices Project

This project is a Java 17 Spring Boot microservices architecture using Maven. It consists of three main services:

- **auth-service**: Entry point for authentication (login/signup)
- **market-service**: Handles market data and related operations
- **trading-service**: Manages trading logic and operations

## Directory Structure

```
/hanuman
  ├── auth-service
  │   ├── src/main/java/com/hanuman/auth/
  │   │     ├── controller/   # REST controllers (login/signup)
  │   │     ├── service/      # Business logic
  │   │     ├── repository/   # JPA repositories
  │   │     └── model/        # Entity models
  │   └── src/main/resources/application.properties
  ├── market-service
  │   ├── src/main/java/com/hanuman/market/
  │   │     ├── controller/   # REST controllers
  │   │     ├── service/      # Business logic
  │   │     ├── repository/   # JPA repositories
  │   └── src/main/resources/application.properties
  ├── trading-service
  │   ├── src/main/java/com/hanuman/trading/
  │   │     ├── controller/   # REST controllers
  │   │     ├── service/      # Business logic
  │   │     ├── repository/   # JPA repositories
  │   └── src/main/resources/application.properties
```

## Database Configuration

All services use PostgreSQL with the following placeholder config in `application.properties`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/Hanuman
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Replace `YOUR_DB_USERNAME` and `YOUR_DB_PASSWORD` with your actual PostgreSQL credentials.

## Getting Started

1. Ensure PostgreSQL is running and a database named `Hanuman` exists.
2. Update the `application.properties` files in each service with your DB credentials.
3. Build each service with Maven:
   ```bash
   cd auth-service && mvn clean install
   cd ../market-service && mvn clean install
   cd ../trading-service && mvn clean install
   ```
4. Run each service:
   ```bash
   cd auth-service && mvn spring-boot:run
   # In new terminals:
   cd ../market-service && mvn spring-boot:run
   cd ../trading-service && mvn spring-boot:run
   ```

## Auth Service Endpoints

- `POST /auth/login` — Login endpoint
- `POST /auth/signup` — Signup endpoint

## Notes
- No mock data is included. All DB configs are real placeholders.
- Each service is independent and can be run separately.
