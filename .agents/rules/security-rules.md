# Security Rules

## [RULE] No Hardcoded Credentials
- **Description**: Absolutely no passwords, API keys, or sensitive information should be stored in source code or `application.properties`.
- **Enforcement**:
  - Use environment variables via `${VAR_NAME}` syntax in configuration files.
  - Manage actual values in a local `.env` file (which should be in `.gitignore`).
  - For Gmail SMTP, use a 16-character **App Password** without spaces.
