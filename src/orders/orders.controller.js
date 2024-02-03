const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//create
function create(req, res, next){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
        return res.status(400).json({ error: 'Order must include at least one dish' });
    }
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}


//read
function read(req, res, next) {
     res.json({ data: res.locals.order });
}

//update
function update(req, res, next) {
    const order = res.locals.order;
    if (!order) {
        return res.status(404).json({ error: 'order not found' });
    }

    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    // Check if provided ID matches the route parameter ID or if it's empty
    if (id !== null && id !== undefined && id !== "" && id !== req.params.orderId ) {
        return res.status(400).json({ error: `id ${id} in request body does not match order id in route` });
    }

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    // If the ID is updated and not null, check for conflicts
    if (id !== undefined && id !== null && id !== "" && id !== order.id) {
        const existingOrder = orders.find(d => d.id === id);
        if (existingOrder) {
            return res.status(409).json({ error: `order id ${id} already exists` });
        }
        order.id = id;
    }

    res.json({ data: order });
}


//delete
function deleteOrder(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex(order => parseInt(order.id) === parseInt(orderId));
    if (index !== -1) {
        orders.splice(index, 1);
        return res.sendStatus(204);
    } else {
        return res.status(404).json({ error: `Order id: ${orderId} not found` });
    }
}

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({
          status: 400,
          message: `Order must include a ${propertyName}`
      });
    };
}

function validateDish(req, res, next){
    const { data } = req.body;
    const dishes = data.dishes;
    if(!Array.isArray(dishes) || dishes.length === 0){
        return res.status(400).json({ error: 'dish must be provided as a non-empty array'});
    }
    next();
}

function validateDishQuantity(req, res, next) {
    const { data } = req.body;
    if (!data || !Array.isArray(data.dishes) ) {
        return res.status(400).json({ error: 'Invalid request body structure' });
    }
    
    const dishes = data.dishes;
    for (let i = 0; i < dishes.length; i++) {
        const dish = dishes[i];
        if (!(Number.isInteger(dish.quantity)) || dish.quantity <= 0 || dish.quantity === undefined) {
            return res.status(400).json({ error: `dish ${i} must have a quantity that is an integer greater than 0.`});
        }
    }
    next();
}


function validateOrderId(req, res, next){
    const { data = { id }} = req.body;
    const id = data.id;
    
    const { orderId } = req.params;
    if(id !== undefined && id !== req.params.orderId && id !== null && id !== ""){
        res.status(400).json({ error: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`});
    }
     next();
}

//do not change
function validateOrderStatus(req, res, next){
    let status;
    if (req.method === 'DELETE' || !req.body) {
        status = res.locals.order.status;
        if(status === 'pending'){
            next();
        }
        else {
            return res.status(400).json({ error: 'Order must have a status of pending in order to get deleted'});
        }
    } else {
        status = req.body.data.status;
    }
    if(!status || !status.trim()){
        return res.status(400).json({ error: 'Order must have a status of pending, preparing, out-for-delivery, delivered'});
    }
    const allowedStatus = ['pending', 'preparing', 'out-for-delivery', 'delivered'];
    if(!allowedStatus.includes(status)){
        return res.status(400).json({ error: 'Order must have a status of pending, preparing, out-for-delivery, delivered'});
    }
    if (status === 'delivered'){
        return res.status(400).json({ error: 'A delivered order cannot be changed'});
    }
    next();
}

//list orders
function list(req, res){
    const { orderId } = req.params;
    if (orderId) {
        const ordersFromId = orders.filter(order => order.id === Number(orderId));
        res.json({ data: ordersFromId });
    }
    else {
        res.json({ data: orders });
    }
}

function orderExists(req, res, next){
    const id = req.params.orderId;
   // const id = res.locals.order.id;
    const foundOrder = orders.find(o => o.id === id);
    if (!foundOrder) {
        return res.status(404).json({ error: `Order with id ${id} not found` });
    }

    res.locals.order = foundOrder;
    next();
}

module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        validateDish,
        validateDishQuantity,
        create
    ],
    list,
    read: [
        orderExists,
        read
    ],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        validateDish,
        validateDishQuantity,
        validateOrderId,
        validateOrderStatus,
        update
    ],
    delete: [
        orderExists,
        validateOrderStatus,
        deleteOrder,
    ]
}