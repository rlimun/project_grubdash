# project_grubdash

This project implements RESTful API endpoints for managing orders and dishes.

## Setup
1. Clone repository to your local machine
2. Run `npm install`
3. Run `npm test` to run the tests for this project

### Endpoints
Orders
* GET /orders: Retrieve a list of all orders.
* POST /orders: Create a new order.
* GET /orders/:orderId: Retrieve details of a specific order.
* PUT /orders/:orderId: Update an existing order.
* DELETE /orders/:orderId: Delete an existing order.

Dishes
* GET /dishes: Retrieve a list of all dishes.
* POST /dishes: Create a new dish.
* GET /dishes/:dishId: Retrieve details of a specific dish.
* PUT /dishes/:dishId: Update an existing dish.
