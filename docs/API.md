# API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "customer"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token"
  }
}
```

### Login User

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile

```http
GET /auth/profile
```

_Requires authentication_

### Update Profile

```http
PUT /auth/profile
```

_Requires authentication_

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

## Restaurant Endpoints

### Get All Restaurants

```http
GET /restaurants
```

**Query Parameters:**

- `search` (string): Search term
- `cuisine` (string): Filter by cuisine type
- `lat` (number): Latitude for location-based results
- `lng` (number): Longitude for location-based results
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": "uuid",
        "name": "Restaurant Name",
        "description": "Description",
        "cuisines": ["Italian", "Pizza"],
        "rating": 4.5,
        "totalReviews": 150,
        "deliveryTime": 30,
        "deliveryFee": 25,
        "minimumOrder": 200,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### Get Restaurant Details

```http
GET /restaurants/{id}
```

### Get Restaurant Menu

```http
GET /restaurants/{id}/menu
```

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "Main Course",
        "items": [
          {
            "id": "uuid",
            "name": "Margherita Pizza",
            "description": "Classic pizza with tomato and mozzarella",
            "price": 299,
            "category": "Pizza",
            "isVegetarian": true,
            "isAvailable": true,
            "preparationTime": 15
          }
        ]
      }
    ]
  }
}
```

## Order Endpoints

### Create Order

```http
POST /orders
```

_Requires authentication_

**Request Body:**

```json
{
  "restaurantId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "specialInstructions": "Extra cheese"
    }
  ],
  "deliveryAddressId": "uuid",
  "paymentMethod": "cash_on_delivery",
  "specialInstructions": "Ring doorbell twice"
}
```

### Get User Orders

```http
GET /orders
```

_Requires authentication_

**Query Parameters:**

- `status` (string): Filter by order status
- `page` (number): Page number
- `limit` (number): Items per page

### Get Order Details

```http
GET /orders/{id}
```

_Requires authentication_

### Track Order

```http
GET /orders/{id}/track
```

_Requires authentication_

**Response:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "GE123456",
      "status": "out_for_delivery",
      "estimatedDeliveryTime": "2023-12-01T14:30:00Z"
    },
    "tracking": {
      "currentLocation": {
        "lat": 12.9716,
        "lng": 77.5946
      },
      "updates": [
        {
          "status": "confirmed",
          "timestamp": "2023-12-01T13:00:00Z",
          "description": "Order confirmed by restaurant"
        }
      ]
    }
  }
}
```

### Cancel Order

```http
PATCH /orders/{id}/cancel
```

_Requires authentication_

### Rate Order

```http
POST /orders/{id}/rate
```

_Requires authentication_

**Request Body:**

```json
{
  "rating": 5,
  "review": "Great food and fast delivery!"
}
```

## User Address Endpoints

### Get User Addresses

```http
GET /users/addresses
```

_Requires authentication_

### Add Address

```http
POST /users/addresses
```

_Requires authentication_

**Request Body:**

```json
{
  "label": "home",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "Bangalore",
  "state": "Karnataka",
  "postalCode": "560001",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "isDefault": true,
  "deliveryInstructions": "Ring doorbell twice"
}
```

### Update Address

```http
PUT /users/addresses/{id}
```

_Requires authentication_

### Delete Address

```http
DELETE /users/addresses/{id}
```

_Requires authentication_

## Error Codes

| Code                  | Description               |
| --------------------- | ------------------------- |
| `VALIDATION_ERROR`    | Request validation failed |
| `UNAUTHORIZED`        | Authentication required   |
| `FORBIDDEN`           | Access denied             |
| `NOT_FOUND`           | Resource not found        |
| `CONFLICT`            | Resource already exists   |
| `RATE_LIMIT_EXCEEDED` | Too many requests         |
| `INTERNAL_ERROR`      | Server error              |

## Rate Limiting

- 100 requests per 15-minute window per IP
- Authenticated users have higher limits
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Pagination

All list endpoints support pagination:

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Response includes pagination metadata:**

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```
