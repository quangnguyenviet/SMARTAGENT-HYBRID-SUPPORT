# Quick Start - Swagger UI Documentation

## Một dòng lệnh để chạy & xem API docs

### 1️⃣ Build & Run
```bash
cd spring-server
mvn clean package -DskipTests && java -jar target/spring-server-0.0.1-SNAPSHOT.jar
```

### 2️⃣ Open Browser
```
http://localhost:8080/swagger-ui.html
```

### 3️⃣ Xong!
Swagger UI sẽ hiển thị tất cả:
- ✅ 9 Chat endpoints
- ✅ Request/Response schemas
- ✅ Try it out buttons
- ✅ Real-time testing

---

## Các URLs hữu ích

| URL | Mục đích |
|-----|---------|
| `http://localhost:8080/swagger-ui.html` | 🎨 Interactive Swagger UI |
| `http://localhost:8080/v3/api-docs` | 📄 OpenAPI JSON definition |
| `http://localhost:8080/v3/api-docs.yaml` | 📋 OpenAPI YAML definition |

---

## Lần đầu tiên? 

1. **First build** ~ 2-3 phút (download dependencies)
2. **Subsequent builds** ~ 30 seconds
3. **Server startup** ~ 5 seconds

---

## Troubleshooting

### ❌ "Cannot find port 8080"
```bash
# Kiểm tra Spring Boot đã start chưa
# Xem logs có errors không
# Port mặc định là 8080, có thể change trong application.yaml
```

### ❌ "Swagger UI 404"
```bash
# Rebuild project
mvn clean install

# Restart server
mvn spring-boot:run
```

### ❌ "Cannot connect to localhost:8080"
```bash
# Kiểm tra server đang chạy:
netstat -tulpn | grep 8080

# Hoặc test endpoint:
curl http://localhost:8080/api/conversations
```

---

## Dependency Info

- **Library**: springdoc-openapi
- **Version**: 2.0.2
- **Auto-generates**: OpenAPI 3.0 schema từ controllers
- **No config needed**: Hoạt động ngay sau khi thêm dependency

---

## Next Steps

1. ✅ Build & run project
2. 🎨 Open Swagger UI
3. 🧪 Test endpoints (Try it out)
4. 📤 Export API docs nếu cần
5. 📝 Share with team

Vậy là xong! Enjoy! 🚀
