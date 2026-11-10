# BizTrack API

BizTrack is a REST API for small business. It tracks **products, stock, suppliers,
purchases, sales and expenses**, and gives managers **reports and a dashboard**.

Every business endpoint needs a login, and what you can do depends on your
role: **ADMIN**, **MANAGER** or **STAFF**.

## Tech stack

| Part         | Tool                                                |
| ------------ | --------------------------------------------------- |
| Runtime      | Node.js (`^20.19.0`, `^22.13.0` or `>=24`)          |
| Web server   | Express 5                                           |
| Database     | PostgreSQL, through Prisma 7 (`@prisma/adapter-pg`) |
| Login        | JSON Web Tokens (JWT), passwords hashed with bcrypt |
| Config check | Zod (the app refuses to start with bad config)      |
| Tests        | Node's built-in test runner (`node --test`)         |
| Code quality | ESLint, Prettier, Husky + lint-staged               |

## Getting started

### 1. What you need

- Node.js 20.19+, 22.13+ or 24+ (check with `node -v`)
- A PostgreSQL database you can connect to

### 2. Install

```bash
git clone https://github.com/M-viviane/biztrack_repository.git
cd biztrack_repository
npm install
```

`npm install` also switches on the git commit hook (see [Code quality](#code-quality)).

### 3. Configure

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

| Variable       | Required                   | What it is                                                              |
| -------------- | -------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL` | Yes                        | PostgreSQL connection string, `postgresql://USER:PASSWORD@HOST:5432/DB` |
| `JWT_SECRET`   | Yes                        | Secret used to sign login tokens. **At least 32 characters.**           |
| `PORT`         | No (default `5000`)        | Port the API listens on                                                 |
| `NODE_ENV`     | No (default `development`) | `development`, `test` or `production`                                   |
| `CORS_ORIGINS` | In production              | Websites allowed to call the API, comma-separated full URLs             |

Make a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The app checks these values when it starts. If one is missing or wrong, it
prints what is wrong and stops, for example:

```
Invalid configuration, the app will not start:
  - JWT_SECRET: JWT_SECRET must be at least 32 characters
```

> Never commit `.env`. It is in `.gitignore`; only `.env.example` is shared.

### 4. Set up the database

```bash
npm run db:migrate   # create the tables
npm run db:seed      # add the ADMIN, MANAGER and STAFF roles
```

The seed is safe to run more than once. Sign-up needs the `STAFF` role, so
run it before registering users.

### 5. Run

```bash
npm run dev     # development: restarts when you change a file
npm start       # production
```

Check it is running:

```bash
curl http://localhost:5000/api/healthroutes
# {"status":"OK","message":"BizTrack API is running"}
```

### 6. Create the first admin

Everyone who registers gets the **STAFF** role. To make the first admin,
register normally, then change that user's role in the database:

```sql
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
WHERE email = 'you@example.com';
```

Log in again afterwards so your new token carries the ADMIN role.

## npm scripts

| Script                   | What it does                                                 |
| ------------------------ | ------------------------------------------------------------ |
| `npm start`              | Start the server                                             |
| `npm run dev`            | Start with nodemon (auto-restart)                            |
| `npm test`               | Run all tests                                                |
| `npm run lint`           | Check code with ESLint and formatting with Prettier          |
| `npm run lint:fix`       | Fix what ESLint and Prettier can fix                         |
| `npm run format`         | Format all files with Prettier                               |
| `npm run db:migrate`     | Apply database migrations (`prisma migrate deploy`)          |
| `npm run db:migrate:dev` | Create a new migration after changing `prisma/schema.prisma` |
| `npm run db:seed`        | Add the roles the app needs                                  |

## Using the API

### Log in

```bash
# 1. Register (new users get the STAFF role)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ama","email":"ama@example.com","password":"a-good-password"}'

# 2. Log in to get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ama@example.com","password":"a-good-password"}'
# {"message":"Login successful","data":{"user":{...},"token":"eyJ..."}}
```

Send the token on every other request. It is valid for **1 day**.

```bash
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer eyJ..."
```

Without a valid token you get **401**. With a role that is not allowed you
get **403**.

### Record a sale

The seller is taken from the token, not from the request body.

```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":1,"quantity":2}]}'
```

### Endpoints and who can call them

"Everyone" means any logged-in user with the ADMIN, MANAGER or STAFF role.

| Method | Path                                          | Who can call it    |
| ------ | --------------------------------------------- | ------------------ |
| GET    | `/api/healthroutes`                           | Public             |
| POST   | `/api/auth/register`                          | Public             |
| POST   | `/api/auth/login`                             | Public             |
| GET    | `/api/auth/profile`                           | Any logged-in user |
| GET    | `/api/products`                               | Everyone           |
| GET    | `/api/products/:id`                           | Everyone           |
| POST   | `/api/products`                               | ADMIN, MANAGER     |
| PUT    | `/api/products/:id`                           | ADMIN, MANAGER     |
| DELETE | `/api/products/:id`                           | ADMIN              |
| PATCH  | `/api/products/:id/restore`                   | ADMIN              |
| GET    | `/api/inventory`                              | Everyone           |
| GET    | `/api/inventory/product/:productId`           | Everyone           |
| GET    | `/api/inventory/movements`                    | Everyone           |
| GET    | `/api/inventory/movements/product/:productId` | Everyone           |
| POST   | `/api/inventory/stock-in`                     | ADMIN, MANAGER     |
| POST   | `/api/inventory/stock-out`                    | ADMIN, MANAGER     |
| GET    | `/api/suppliers`                              | Everyone           |
| GET    | `/api/suppliers/:id`                          | Everyone           |
| POST   | `/api/suppliers`                              | ADMIN, MANAGER     |
| GET    | `/api/category`                               | ADMIN, MANAGER     |
| GET    | `/api/purchase`                               | Everyone           |
| GET    | `/api/purchase/:id`                           | Everyone           |
| POST   | `/api/purchase`                               | ADMIN, MANAGER     |
| PUT    | `/api/purchase/:id`                           | ADMIN, MANAGER     |
| DELETE | `/api/purchase/:id`                           | ADMIN              |
| GET    | `/api/sales`                                  | Everyone           |
| GET    | `/api/sales/:id`                              | Everyone           |
| POST   | `/api/sales`                                  | Everyone           |
| GET    | `/api/expenses`                               | ADMIN, MANAGER     |
| GET    | `/api/expenses/:id`                           | ADMIN, MANAGER     |
| POST   | `/api/expenses`                               | ADMIN, MANAGER     |
| PUT    | `/api/expenses/:id`                           | ADMIN, MANAGER     |
| DELETE | `/api/expenses/:id`                           | ADMIN              |
| GET    | `/api/reports/sales-summary`                  | ADMIN, MANAGER     |
| GET    | `/api/reports/expense-summary`                | ADMIN, MANAGER     |
| GET    | `/api/reports/revenue`                        | ADMIN, MANAGER     |
| GET    | `/api/reports/profit`                         | ADMIN, MANAGER     |
| GET    | `/api/dashboard`                              | ADMIN, MANAGER     |
| GET    | `/api/users`                                  | ADMIN              |
| GET    | `/api/users/:id`                              | ADMIN              |
| GET    | `/api/admin/users`                            | ADMIN              |

A test (`test/authCoverage.test.js`) checks that every route except the three
public ones needs a login. If you add a route without `authMiddleware`, the
tests fail.

### Retired products

Deleting a product does not remove it. It is **retired** (`isActive = false`),
so past sales and purchases still point to it.

- Retired products are hidden from product lists, and from `GET /:id` for
  everyone except ADMIN.
- They cannot be edited, sold, purchased or stocked in (**409**). Stock-out
  is still allowed, to write off what is left.
- An ADMIN can bring one back with `PATCH /api/products/:id/restore`.

## Project structure

```
prisma/
  schema.prisma       database tables
  migrations/         database changes, in order (generated, do not edit)
  seed.js             adds the roles (npm run db:seed)
src/
  server.js           checks the config, then starts the server
  app.js              Express app: middleware and routes (no port, so tests can load it)
  config/             env.js (config check) and prisma.js (database client)
  routes/             URLs, plus which login and roles each one needs
  middleware/         authMiddleware (login), roleMiddleware (roles), validator
  controllers/        read the request, send the response
  services/           business rules and database work
  validators/         Zod schemas for request bodies
  utils/              helpers (JWT)
test/                 automated tests (*.test.js)
```

A request goes: **route → middleware → controller → service → database**.

## Testing

```bash
npm test
```

The tests use a **fake database**, so they never touch real data and do not
need PostgreSQL or a `.env` file. They run on Node 20.19+ and Node 24.

## Code quality

- **ESLint** finds likely bugs (unused variables, `==` instead of `===`).
- **Prettier** keeps formatting the same everywhere, so reviews can focus
  on logic.
- **Husky + lint-staged** run both on the files you commit. If ESLint finds
  an error the commit is stopped, so fix it and commit again.

Run `npm run lint` before you open a pull request.

## Contributing

1. Pick an issue from the [project board](https://github.com/users/M-viviane/projects/2).
2. Branch from `develop`: `git switch develop && git pull && git switch -c fix/bt-0xx-short-name`
3. Make the change, add or update tests, then run `npm test` and `npm run lint`.
4. Push and open a pull request **into `develop`** (not `main`).
5. Pull requests into `develop` do not close issues automatically, so close
   the issue by hand after the merge.

## License

ISC
