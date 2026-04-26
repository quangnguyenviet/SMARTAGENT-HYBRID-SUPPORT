# Exception Handling Rules

## [RULE] Centralized Exception Handling
- **Description**: Use a centralized approach to handle exceptions across all services to ensure consistent API responses.
- **Enforcement**:
  - Use `@RestControllerAdvice` to catch and format exceptions globally.
  - Throw **Custom Exceptions** (e.g., `AppException`) instead of generic ones like `RuntimeException`.
  - Every custom exception must be associated with an `ErrorCode` enum containing:
    - Unique error code.
    - Human-readable message.
    - Appropriate HTTP Status (e.g., 400 for bad request, 404 for not found).

## [RULE] Logging Exceptions
- **Description**: Always log exceptions with enough context.
- **Enforcement**:
  - Use `@Slf4j` for logging.
  - Log errors at the appropriate level (`log.error` for system failures, `log.warn` for business logic violations).
  - Include relevant IDs (userId, courseId, etc.) in the log message to aid debugging.

## [RULE] Asynchronous Error Handling (Kafka)
- **Description**: Handle errors in Kafka consumers to prevent blocking the partition.
- **Enforcement**:
  - Use `ErrorHandlingDeserializer` for Kafka messages to handle serialization errors gracefully.
  - Implement retry mechanisms or Dead Letter Queues (DLQ) for transient failures (e.g., external API downtime).
  - Wrap listener logic in try-catch blocks to log and handle specific business errors without crashing the consumer.
