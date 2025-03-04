const express = require("express");

const shopController = require("../controller/shopController");
const shopControllerProduct = require("../controller/shopProductController");

const routes = express.Router();

routes.get("/signup", shopController.getSignup);
routes.post("/signup", shopController.postSignup);

routes.get("/login", shopController.getlogin);
routes.post("/login", shopController.postlogin);

routes.get("/shop", shopControllerProduct.getShop);
routes.get("/details", shopControllerProduct.getDetails);
routes.get("/addProduct", shopControllerProduct.getAddProduct);
routes.post("/addProduct", shopControllerProduct.postAddProduct);

routes.post("/delete", shopControllerProduct.deleteProduct);
routes.get("/edit/:productId", shopControllerProduct.getEditProduct);
routes.post("/edit", shopControllerProduct.postEditProduct);

routes.get("/cart", shopControllerProduct.getCart);
routes.post("/addToCart", shopControllerProduct.postCart);
routes.get("/order", shopControllerProduct.getOrder);
routes.post("/order", shopControllerProduct.postOrder);

routes.get('/order/:orderId' , shopControllerProduct.getInvoice)

routes.get("/", shopController.mainPage);

module.exports = routes;
