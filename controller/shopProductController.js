const Product = require("../models/products");
const path = require("path");
const fs = require("fs");
const pdfdoc = require("pdfkit");
const Order = require("../models/order");

exports.getShop = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop", {
        prods: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
  res.render("addProduct");
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  const imageUrl = image.filename;
  console.log(imageUrl);
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user,
  });
  return product
    .save()
    .then(() => {
      res.redirect("/shop");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndDelete(prodId).then(() => {
    res.redirect("/shop");
  });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  if (!prodId) {
    return res.redirect("/");
  }

  Product.findById(prodId)
    .then((prod) => {
      if (!prod) {
        return res.redirect("/");
      }
      res.render("editProduct", { prod: prod });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
};

exports.postEditProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;

  const description = req.body.description;
  const prodId = req.body.productId;
  Product.findById(prodId).then((product) => {
    product.title = title;
    product.price = price;
    if (image) {
      product.imageUrl = image.filename;
    } else {
      product.imageUrl = product.imageUrl;
    }
    product.description = description;
    return product.save().then(() => {
      res.redirect("/shop");
    });
  });
};

exports.getDetails = (req, res, next) => {
  const prodId = req.query.productId;

  Product.findById(prodId).then((product) => {
    res.render("details", {
      product: product,
    });
  });
};

exports.getCart = (req, res, next) => {
  req.user.populate("cart.items.productId").then((user) => {
    const product = user.cart.items;
    res.render("cart", { prods: product });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrder = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((order) => {
      res.render("order", {
        order: order,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/order");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      const invoiceName = `${orderId}.pdf`;
      const invoicePath = path.join("data", invoiceName);
      const pdfDoc = new pdfdoc();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename"${invoiceName}"`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      let totalprice = 0;
      order.products.forEach((prod) => {
        totalprice += prod.quantity * prod.product.price;
        pdfDoc.text(
          `${prod.product.title} - ${prod.quantity} x ${prod.product.price}$`
        );
      });
      pdfDoc.text(`total price is ${totalprice}`);
      pdfDoc.end();
    })
    .catch((err) => {
      console.log(err);
    });
};
