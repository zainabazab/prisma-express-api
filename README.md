
# Prisma Express API

A RESTful backend API built with Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL.

## Features

- User CRUD operations
- Product CRUD operations
- Order creation and retrieval
- Password hashing with bcrypt
- Relational database design
- Transactional order processing
- Stock validation and atomic stock updates
- Input validation and database error handling

## Technologies

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- bcrypt
- Postman

## Database Models

- User
- Product
- Order
- OrderItem

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/zainabazab/prisma-express-api.git
   cd prisma-express-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure your PostgreSQL connection:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/prisma_express_db"
   ```

   Replace the placeholders with your local PostgreSQL credentials.

4. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

5. Apply database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:

   ```bash
   npx tsx watch src/server.ts
   ```

## API Base URL

`http://localhost:5000`

## Main Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /api/users | Get users |
| POST | /api/users | Create user |
| GET | /api/products | Get products |
| POST | /api/products | Create product |
| GET | /api/orders | Get orders |
| POST | /api/orders | Create order |

Additional GET by ID, PUT, and DELETE endpoints are available for users and products.

## Learning Outcomes

This project strengthened my understanding of relational database design, Prisma ORM, persistent data storage, REST API development, and database transactions.

