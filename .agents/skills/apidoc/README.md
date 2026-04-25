# APIDoc Skill - Usage Guide

This skill helps you generate comprehensive API documentation for your Spring Boot REST APIs.

## Quick Start

### 1. Trigger the Skill
Use any of these commands:
- `/apidoc` (if available as slash command)
- Chat with: "Tạo API documentation"
- Chat with: "Generate APIDoc cho Chat Module"
- Chat with: "Sinh tài liệu API"

### 2. Choose Output Format
When prompted, select one of:
- **Markdown** (recommended for Git)
- **OpenAPI/Swagger** (industry standard)
- **Postman Collection** (for testing)
- **HTML** (professional presentation)

### 3. Specify Scope
Indicate which modules/controllers to document:
- Chat Module only
- Orchestrator Module only
- Security Module only
- All modules

### 4. Generate & Review
The skill will:
- Analyze your controllers
- Extract endpoint information
- Generate documentation
- Create a file in `docs/` folder
- Suggest a commit message

## Output Examples

### Example 1: Chat Module Markdown
```markdown
# Chat Module API Documentation

## POST /api/conversations
Create a new conversation

**Request**: CreateConversationRequest (customerId, channel)
**Response**: 201 Created - ConversationDTO
**Error**: 500 Internal Server Error

### Example
curl -X POST http://localhost:8080/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"customerId": 123, "channel": "zalo"}'
```

### Example 2: OpenAPI YAML
```yaml
paths:
  /api/conversations:
    post:
      summary: Create a new conversation
      tags:
        - Chat
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateConversationRequest'
      responses:
        '201':
          description: Conversation created successfully
```

### Example 3: Postman Collection
```json
{
  "info": {"name": "SmartAgent API"},
  "item": [
    {
      "name": "Chat",
      "item": [
        {
          "name": "Create Conversation",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/conversations"
          }
        }
      ]
    }
  ]
}
```

## File Organization

After generation, files will be organized as:

```
docs/
├── API-Documentation.md          # Main Markdown doc
├── openapi.yaml                  # OpenAPI 3.0 specification
├── SMARTAGENT-API.postman_collection.json
├── v1/
│   ├── Chat-API.md
│   ├── Orchestrator-API.md
│   └── Security-API.md
└── README.md                      # How to use these docs
```

## Best Practices

### 1. Keep DTOs Updated
When you modify DTOs, regenerate the docs:
```bash
# Chat: "Regenerate API docs after DTO changes"
```

### 2. Add Code Comments
JavaDoc comments in controllers:
```java
/**
 * Create a new conversation for a customer
 * 
 * @param request containing customerId and channel
 * @return Created conversation
 */
@PostMapping
public ResponseEntity<ApiResponse<ConversationDTO>> createConversation(...)
```

### 3. Version Your Docs
When making breaking changes:
- Create new version folder: `docs/v2/`
- Keep old docs: `docs/v1/`
- Update main README pointing to current version

### 4. Include Workflows
Add section showing common workflows:
- Create conversation → Send message → Get history → Close
- User message → AI scoring → Handover to agent

### 5. Document All Error Codes
```markdown
| Code | Meaning | When |
|------|---------|------|
| 404 | Not Found | Conversation doesn't exist |
| 500 | Server Error | Unexpected error occurred |
```

## Integration with Tools

### Swagger UI
To view OpenAPI docs with interactive UI:

1. Add dependency to pom.xml:
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```

2. Access at: `http://localhost:8080/swagger-ui.html`

### Postman
To use Postman collection:

1. Download the `.postman_collection.json` file
2. Open Postman
3. Click "Import" → Select file
4. Set `base_url` environment variable
5. Run requests and see responses

### GitHub Pages
To host documentation on GitHub Pages:

1. Copy `docs/` folder to `.github/` 
2. Configure GitHub Pages to serve from `/docs`
3. Access at: `https://username.github.io/project/`

## Troubleshooting

### No Controllers Found
- Ensure controllers have `@RestController` annotation
- Check that controllers are in scanned packages
- Verify controller paths are correct

### Missing DTOs
- Add JavaDoc to DTO classes
- Make sure DTOs are used in controller methods
- Check that imports are correct

### Swagger/OpenAPI Validation Fails
- Use online validator: https://validator.swagger.io
- Check YAML syntax (tabs vs spaces, indentation)
- Verify all `$ref` paths are correct

## File Locations

- **SKILL.md** - Skill definition (this folder)
- **TEMPLATE-MARKDOWN.md** - Markdown template with examples
- **TEMPLATE-OPENAPI.yaml** - OpenAPI 3.0 template
- **README.md** - This file

## Next Steps

1. Generate documentation for Chat Module
2. Review and customize as needed
3. Commit to git with message: `docs(api): generate APIDoc`
4. Share with frontend/QA teams
5. Update as you add new endpoints
