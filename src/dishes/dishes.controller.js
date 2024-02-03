const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//list dishes
function list(req, res){
    const { dishId } = req.params;
    if (dishId) {
        const dishesFromOrder = dishes.filter(dish => dish.id === Number(dishId));
        res.json({ data: dishesFromOrder });
    }
    else {
        res.json({ data: dishes });
    }
}

//dont change, this passes tests
function read(req, res, next){
    const dishId = req.params.dishId;
    const dish = dishes.find(d => d.id === dishId);
    if (dish) {
        res.locals.dish = dish;
        res.json({ data: dish });
    } else {
        return res.status(404).json({ error: `Dish with ID ${dishId} not found`})
    }
}

//dont change, this passes
function create(req, res, next){
     const { data: { name, description, image_url, price } = {} } = req.body;
     let newDish = {
         id: nextId(),
         name: name,
         description: description,
         image_url: image_url,
         price: price,
     };
     dishes.push(newDish);
     res.status(201).json({ data: newDish });
 }
 

//don't change, this passes tests
function dishExists(req, res, next){
    const id = req.params.dishId;
    const foundDish = dishes.find(dish => dish.id === id);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    else {
        return res.status(404).json({ error: `Dish id not found: ${id}` });
    }
}

//dont change
function update(req, res, next) {
    const dish = res.locals.dish;
    if (!dish) {
        return res.status(404).json({ error: 'Dish not found' });
    }

    const { data: { id, name, description, price, image_url } = {} } = req.body;

    // Check if provided ID matches the route parameter ID or if it's empty
    if (id !== undefined && id !== req.params.dishId && id !== null && id !== "") {
        return res.status(400).json({ error: `id ${id} in request body does not match dish id in route` });
    }

    // Update dish properties
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    // If the ID is updated, check for conflicts
    if (id !== undefined && id !== dish.id) {
        const existingDish = dishes.find(d => d.id === id);
        if (existingDish) {
            return res.status(409).json({ error: 'Dish ID already exists' });
        }
        // If the ID is unique, update the dish's ID
        dish.id = id;
    }

    res.json({ data: dish });
}

//dont change
function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      return next({
          status: 400,
          message: `Dish must include a ${propertyName}`
      });
    };
}

//dont change
function validatePrice(req, res, next){
        const { data = { price } } = req.body;
        const price = data.price;
        if (price > 0 && Number.isInteger(price)) {
            next();
        }
        return res.status(400).json({ error: 'Dish must have a price that is a non-negative integer' });
}

//dont change
function validateImageUrl(req, res, next){
        const { data = { image_url } } = req.body;
        const image_url = data.image_url;
        if (!image_url || image_url.trim() === '') {
            return res.status(400).json({ error: 'Dish must include a non-empty image_url' });
        }
        next();
}

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        validatePrice,
        validateImageUrl,
        create,
    ],
    list,
    read: [
        dishExists,
        read,
    ],
    update: [
       dishExists,
       bodyDataHas("name"),
       bodyDataHas("description"),
       bodyDataHas("price"),
       validatePrice,
       validateImageUrl,
       update
    ]
}