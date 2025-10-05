# Banking Transactions API

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/parnexcodes/banking-assignment.git
cd banking-assignment
```

### 2. Install Dependencies

```bash
npm install
```

Or if you're using Bun:

```bash
bun install
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Then edit the `.env` file and update the database credentials:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banking_system
```

Replace `your_password` with your actual MySQL root password.

### 4. Setup MySQL Database

Ensure your MySQL server is running and create the database.
```bash
mysql -u root -p
```
Then in the MySQL console:
```sql
CREATE DATABASE banking_system;
EXIT;
```

### 5. Run Database Migrations

Execute the migration script to create the necessary tables:

```bash
npm run migrate
```

Or with Bun:

```bash
bun run migrate
```

### 6. Seed the Database (Optional)

To populate the database with sample data for testing:

```bash
npm run seed
```

Or with Bun:

```bash
bun run seed
```

This will create:
- Sample users with API keys
- Test accounts with initial balances
- Sample transactions

### Quick Setup

To run both migrations and seeding in one command:

```bash
npm run setup
```

Or with Bun:

```bash
bun run setup
```

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

Or with Bun:

```bash
bun run dev
```

The server will start on `http://localhost:8000` (default port).

### Production Mode

1. Build the TypeScript code:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

## API Endpoints

### Health Check

```http
GET /health
```

### Authentication

All API requests (except reports) require a secret key in the header:

```
X-Secret-Key: <your-secret-key>
```

### Account Endpoints

#### Get Account Balance

```http
GET /api/accounts/:id/balance
X-Secret-Key: <your-secret-key>
```

Example:
```http
GET /api/accounts/1/balance
X-Secret-Key: change_this_key
```

### Transaction Endpoints

#### Submit Transaction

**Deposit:**
```http
POST /api/transactions
Content-Type: application/json
X-Secret-Key: <your-secret-key>

{
  "type": "deposit",
  "amount": 500.00,
  "destination_account_id": 1
}
```

**Withdrawal:**
```http
POST /api/transactions
Content-Type: application/json
X-Secret-Key: <your-secret-key>

{
  "type": "withdrawal",
  "amount": 200.00,
  "source_account_id": 1
}
```

**Transfer:**
```http
POST /api/transactions
Content-Type: application/json
X-Secret-Key: <your-secret-key>

{
  "type": "transfer",
  "amount": 300.00,
  "source_account_id": 1,
  "destination_account_id": 2
}
```

### Report Endpoints

#### Get Summary Report

```http
GET /api/reports/summary
```

Note: The summary report endpoint does not require authentication.

Returns:
- Current balance for each account
- Largest single transaction per account
- Number of failed transactions with reasons

## Testing with Postman

A Postman collection is included in the `collections/` directory:

1. Open Postman
2. Import the collection: `collections/Banking-Transactions-API.postman_collection.json`
3. Update the environment variables with your secret keys (default: `change_this_key`)
   - `aliceSecretKey` - for Account 1
   - `bobSecretKey` - for Account 2
   - `charlieSecretKey` - for Account 3
4. Start testing the endpoints

The seeded database includes three users:
- Alice (Account 1)
- Bob (Account 2)
- Charlie (Account 3)

Each user has their own secret key for authentication.

## Project Structure

```
banking-assignment/
├── .env.example               # Environment variables template
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration files
│   ├── controller/            # Request handlers
│   ├── middleware/            # Express middleware (auth, validation, error handling)
│   ├── model/                 # Data models
│   ├── route/                 # API routes
│   ├── service/               # Business logic
│   └── utils/                 # Utility functions
├── migrations/                # Database migration scripts
├── scripts/                   # Utility scripts (seed data, etc.)
├── collections/               # Postman collection
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banking_system
```