# Database Rules

## [RULE] Flyway First
- **Description**: All changes to the database structure (PostgreSQL) must be made through Flyway migration scripts.
- **Enforcement**:
  - Never modify the database schema directly using DB management tools (pgAdmin, DBeaver, etc.) in shared or production environments.
  - New migrations must be placed in `src/main/resources/db/migration` with the correct versioning format (e.g., `V1__init.sql`, `V2__add_table.sql`).
  - Every Entity change that affects the schema must be accompanied by a corresponding Flyway script.
