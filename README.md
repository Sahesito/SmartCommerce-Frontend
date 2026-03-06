# SmartCommerce Frontend

Angular 21 web interface for the SmartCommerce e-commerce platform. Provides a responsive UI with role-based access control for ADMIN, SELLER, and CLIENT users.

---

## Tech Stack

| Technology | Version |
|------------|---------|
| Angular | 21 |
| PrimeNG | 21 |
| TypeScript | 5.9 |
| SCSS | — |
| Node.js | 22 |
| npm | 11 |

---

## Prerequisites

- Node.js 22.x
- npm 11.x
- Angular CLI 21

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sahesito/smartcommerce.git
cd Frontend
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Run in development mode

```bash
ng serve --proxy-config proxy.conf.json
```

Open `http://localhost:4200`

---

## Proxy Configuration

In development, Angular proxies API requests to the backend microservices:

| Route | Service | Port |
|-------|---------|------|
| /auth | Auth Service | 8081 |
| /users | User Service | 8082 |
| /products | Product Service | 8083 |
| /inventory | Inventory Service | 8084 |
| /orders | Order Service | 8085 |
| /payments | Payment Service | 8086 |

---

## Production Build

```bash
npm run build
```

Output is generated in `dist/Frontend/browser`.

---


```bash
docker pull sahesito/smartcommerce-frontend
```

Open `http://localhost:4200`

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/         # TypeScript interfaces
│   │   ├── services/       # HTTP services
│   │   └── guards/         # Route guards
│   ├── pages/
│   │   ├── login/          # Login page
│   │   ├── register/       # Register page
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── shop/           # Product catalog (CLIENT)
│   │   ├── users/          # User management (ADMIN)
│   │   ├── products/       # Product management (ADMIN/SELLER)
│   │   ├── inventory/      # Inventory management (ADMIN/SELLER)
│   │   ├── orders/         # Order management
│   │   └── payments/       # Payment management (ADMIN)
│   └── shared/
│       └── components/     # Shared components
├── environments/
│   └── environment.ts
└── proxy.conf.json
```

---

## Pages & Role Access

| Page | ADMIN | SELLER | CLIENT |
|------|-------|--------|--------|
| Login | ✅ | ✅ | ✅ |
| Register | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Shop | ✅ | ✅ | ✅ |
| Users | ✅ | ❌ | ❌ |
| Products | ✅ | ✅ | ❌ |
| Inventory | ✅ | ✅ | ❌ |
| Orders | ✅ | ✅ | ✅ |
| Payments | ✅ | ❌ | ❌ |

---

## Authentication

The app uses JWT tokens stored in `localStorage`. On login, the token is decoded to extract the user role and redirect accordingly.

Route guards protect each page based on role:

```
/dashboard  → ADMIN, SELLER, CLIENT
/users      → ADMIN only
/products   → ADMIN, SELLER
/inventory  → ADMIN, SELLER
/payments   → ADMIN only
```

---

## Environment Variables

```typescript
// src/environments/environment.ts
export const environment = {
    production: false,
    apiUrl: ''
};
```

In production (Docker), the nginx proxy handles routing to backend services.

---

## nginx Configuration (Docker)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /auth {
        proxy_pass http://auth-service:8081;
    }

    location /users {
        proxy_pass http://user-service:8082;
    }

    location /products {
        proxy_pass http://product-service:8083;
    }

    location /inventory {
        proxy_pass http://inventory-service:8084;
    }

    location /orders {
        proxy_pass http://order-service:8085;
    }

    location /payments {
        proxy_pass http://payment-service:8086;
    }
}
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `ng serve --proxy-config proxy.conf.json` | Start development server |
| `npm run build` | Build for production |
| `ng test` | Run unit tests |

---

## Related Repositories

- [Auth Service](https://github.com/sahesito/smartcommerce-auth)
- [User Service](https://github.com/sahesito/smartcommerce-users)
- [Product Service](https://github.com/sahesito/smartcommerce-products)
- [Inventory Service](https://github.com/sahesito/smartcommerce-inventory)
- [Order Service](https://github.com/sahesito/smartcommerce-orders)
- [Payment Service](https://github.com/sahesito/smartcommerce-payments)

---
