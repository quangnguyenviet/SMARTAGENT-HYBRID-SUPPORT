# Skill: Generate API Documentation with Swagger/OpenAPI

## Goal
Tự động thêm Swagger UI (springdoc-openapi) vào Spring Boot project và sinh tài liệu API tương tác. Giúp frontend/QA developers nhanh chóng xem & test tất cả endpoints trực tiếp từ URL mà không cần thêm công cụ khác.

## Trigger
Người dùng yêu cầu: "Tạo OpenAPI documentation", "Sinh APIDoc với Swagger", "Setup Swagger UI", "Add springdoc dependency", "Tạo ý kiến API".

## Execution Steps

### 1. Thêm Dependency vào pom.xml
Thêm springdoc-openapi dependency vào `<dependencies>`:
```xml
<!-- Swagger UI & OpenAPI Documentation -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```

**Kết quả**: Maven sẽ tự động:
- Scan @RestController, @RequestMapping, @GetMapping, @PostMapping, etc.
- Trích xuất endpoint info từ annotations
- Generate OpenAPI 3.0 schema từ DTOs
- Expose API definition tại `/v3/api-docs`
- Cung cấp Swagger UI tại `/swagger-ui.html`

### 2. Configure Application Properties (Optional)
Thêm vào `application.yaml` để customize:
```yaml
springdoc:
  api-docs:
    path: /v3/api-docs              # OpenAPI JSON endpoint
  swagger-ui:
    path: /swagger-ui.html           # Swagger UI path
    tagsSorter: alpha                # Sort tags alphabetically
    operationsSorter: alpha          # Sort operations
    displayOperationId: true         # Show operation IDs
  cache:
    disabled: true                   # Refresh on every reload (dev mode)
```

### 3. Build Project
```bash
mvn clean package
```

Dependency sẽ được download từ Maven Central & compile cùng project.

### 4. Run Spring Boot Application
```bash
mvn spring-boot:run
# hoặc
java -jar target/spring-server-0.0.1-SNAPSHOT.jar
```

Spring Boot sẽ khởi động & tự động generate OpenAPI schema.

### 5. Access Swagger UI
Mở browser, truy cập:
```
http://localhost:8080/swagger-ui.html
```

Swagger UI sẽ tự động:
- Load OpenAPI schema từ `/v3/api-docs`
- Render interactive documentation
- Hiển thị tất cả endpoints, request/response examples
- Cho phép "Try it out" - test endpoints trực tiếp

### 6. View Raw OpenAPI JSON
Nếu muốn export hoặc dùng với tools khác:
```
http://localhost:8080/v3/api-docs
```

Sẽ trả về JSON định nghĩa tất cả endpoints (OpenAPI 3.0 format)

## Output Formats

### Format 1: Markdown (Recommended for Git)
**File**: `docs/API-Documentation.md`
**Tools**: Đọc được trực tiếp trên GitHub, dễ maintain

### Format 2: OpenAPI 3.0 (Swagger)
**File**: `docs/openapi.yaml`
**Tools**: Có thể mở bằng Swagger UI, generate SDK, validate

### Format 3: Postman Collection
**File**: `docs/SMARTAGENT-API.postman_collection.json`
**Tools**: Import vào Postman, test APIs trực tiếp

## Workflow Example

###Workflow Example

### Step 1: Add Dependency
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```
✅ Maven downloads từ Central (first time)

### Step 2: Build & Run
```bash
mvn clean package && mvn spring-boot:run
```

**Output**:
```
Started SpringServerApplication in 5.234 seconds
Tomcat started on port(s): 8080
```

### Step 3: Open Browser
Truy cập: `http://localhost:8080/swagger-ui.html`

Swagger UI sẽ hiển thị:
- **Chat Module** section
  - POST /api/conversations
  - GET /api/conversations/{id}
  - GET /api/conversations/customer/{customerId}
  - POST /api/conversations/{id}/messages
  - etc.
- Mỗi endpoint có:
  - Description
  - Request/Response schemas
  - Try it out button
  - cURL command
  - Response examples

### Step 4: Test Endpoint
Click "Try it out" → Fill in parameters → Click "Execute"

Example: POST /api/conversations
```json
{
  "customerId": 123,
  "channel": "zalo"
}
```
→ Live response từ server

### Step 5: Export API Definition
Nếu muốn export để dùng với tools khác:
```bash
# Download OpenAPI JSON
curl http://localhost:8080/v3/api-docs > api-docs.json

# CKey Features of Springdoc-OpenAPI

| Feature | Benefit |
|---------|---------|
| **Auto-scan** | Tự động detect @RestController & endpoints |
| **Zero config** | Hoạt động ngay sau khi add dependency |
| **DTO inference** | Tự động generate schema từ DTO classes |
| **Interactive UI** | Try-it-out button, live testing |
| **Multiple formats** | OpenAPI JSON, YAML, Swagger UI HTML |
| **Real examples** | Auto-generate từ response bodies |

## Best Practices

1. **Add JavaDoc to Controllers**:
```java
/**
 * Create a new conversation
 * @param request CreateConversationRequest (customerId, channel)
 * @return ConversationDTO
 */
@PostMapping
public ResponseEntity<ApiResponse<ConversationDTO>> createConversation(...)
```
→ Description sẽ appear trong Swagger UI

2. **Add @Operation & @ApiResponse Annotations** (Optional):
```java
@Operation(summary = "Create conversation", description = "Creates new conversation for customer")
@ApiResponse(responseCode = "201", description = "Conversation created")
@ApiResponse(responseCode = "400", description = "Invalid request")
@PostMapping
public ResponseEntity<...> createConversation(...)
```

3. **Add @Schema to DTOs**:
```java
@Schema(description = "Request to create conversation")
public class CreateConversationRequest {
    @Schema(description = "Customer ID", example = "123")
    private Long customerId;
}
```

4. **Use Descriptive Field Names**: DTO fields tự động become API docs

5. **Keep API Contracts Stable**: Breaking changes cần version bump (v2 endpoints)

## URL Cheat Sheet

```
API Definition:   http://localhost:8080/v3/api-docs
Swagger UI:       http://localhost:8080/swagger-ui.html
OpenAPI JSON:     http://localhost:8080/v3/api-docs.json
OpenAPI YAML:     http://localhost:8080/v3/api-docs.yaml
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Swagger UI 404 | Đảm bảo springdoc dependency thêm vào pom.xml & rebuild |
| Endpoints không appear | Check @RestController & @RequestMapping annotations |
| DTOs không schema | Add @Schema annotations hoặc public getters/setters |
| Can't access localhost:8080 | Check Spring Boot running: `mvn spring-boot:run` |

## Notes
- **Priority**: High - Cực kỳ quan trọng cho team collaboration
- **Estimated Duration**: 5-10 phút (thêm dependency + start server)
- **Dependencies**: Spring Boot project, Maven, Java 11+
- **Maintenance**: Auto-updated when code changes (refresh browser)
- **Output**: Live Swagger UI + downloadable OpenAPI JSON/YAML
- **No manual docs needed**: Swagger auto-generates từ code