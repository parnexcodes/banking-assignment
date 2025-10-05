# Reflection Document
---

## Time Investment

**Total Time Spent:** ~3-4 hours

**Breakdown:**
- **Requirements Analysis & Planning:**
  - Read and understood requirements thoroughly
  - Sketched database schema design
  - Planned API endpoints and validation rules
  
- **Project Setup & Configuration:**
  - TypeScript configuration
  - Express app setup
  - Database connection
  - Environment variable configuration
  
- **Core Implementation:**
  - Transaction service with database transactions
  - Account and user services
  - Controllers and routes
  - Authentication middleware
  - Validation schemas
  - Error handling
  
- **Testing & Debugging:**
  - Manual testing with different scenarios
  - Tested edge cases (negative amounts, insufficient funds)
  - Tested all transaction types
  - Created Postman collection
  
- **Seed Data & Documentation:**
  - Created seed script with sample data
  - Wrote README
  - Added code comments

---

## What Went Well

### 1. **Database Design**
The schema design proved robust and flexible.

- Using a single `transactions` table with nullable source/destination accounts worked perfectly
- ENUM types for transaction type and status prevent invalid data
- Storing both successful and failed transactions in one place simplified reporting
- The UUID for transaction_id allows easy transaction tracking

---

### 2. **Transaction Safety**
Proper use of database transactions ensured data integrity.

```typescript
await connection.beginTransaction();
try {
  // All operations
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
}
```

- No partial transfers possible
- Balance updates are atomic
- Race conditions prevented by row locking

---

### 3. **Type Safety**
TypeScript caught several bugs during development.

Examples of bugs prevented:
- Passing wrong parameter types to database queries
- Misspelling property names in objects
- Forgetting required fields in API requests

---

### 4. **Error Handling**
Consistent error responses across all endpoints.

- Custom `AppError` class for known errors
- Global error handler middleware
- Proper HTTP status codes (400, 401, 404, 500)
- User-friendly error messages

---

### 5. **Validation Layer**
Joi schemas prevent invalid data from reaching business logic.

Particularly because of the conditional validation:
```typescript
source_account_id: Joi.when('type', {
  is: Joi.string().valid('withdrawal', 'transfer'),
  then: Joi.required(),
  otherwise: Joi.forbidden()
})
```

This enforces that withdrawals/transfers need a source account, but deposits don't.

---

### 6. **Code Organization**
Clean separation of concerns made the code easy to navigate.

- Routes define endpoints
- Controllers handle request/response
- Services contain business logic
- Middleware handles cross-cutting concerns

---

## What I Would Improve With More Time

### 1. **Automated Testing** 
**Current State:** Manual testing only.

**What I'd Add:**
```typescript
// Unit tests for services
describe('TransactionService', () => {
  it('should reject withdrawal with insufficient funds', async () => {
    // Test implementation
  });
});

// Integration tests for API endpoints
describe('POST /api/transactions', () => {
  it('should create a deposit transaction', async () => {
    // Test implementation
  });
});
```

**Tools:** Jest + Supertest for API testing

---

### 2. **Transaction History Endpoint**
**Current State:** Can only get summary report.

**What I'd Add:**
```typescript
GET /api/accounts/:accountId/transactions
// Returns paginated list of all transactions for an account
```

**Features:**
- Pagination (limit, offset)
- Filtering by date range
- Filtering by transaction type
- Sorting options

---


### 3. **Input Sanitization**
**Current State:** Relying on parameterized queries.

**What I'd Add:**
- Sanitize account numbers to prevent injection
- Rate limiting per API key
- Request size limits