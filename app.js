const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const User = require("./models/user");
const shopRoute = require("./routes/route");
const multer = require("multer");
const socket = require("./socket");
const http = require("http");
const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

const MongoUrl =
  "mongodb+srv://aimen:183258@cluster0.w0tz2.mongodb.net/afterNmarket?retryWrites=true&w=majority&appName=Cluster0";

const store = new MongoDbStore({
  uri: MongoUrl,
  collection: "sessions",
});

app.use(
  session({
    store: store,
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

const fileSorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  multer({
    fileFilter: fileFilter,
    storage: fileSorage,
  }).single("image")
);

app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLogged;
  next();
});

app.use(shopRoute);

mongoose.connect(MongoUrl).then(() => {
  socket.init(server)
  server.listen(3000 , () =>  {
    console.log('server work on port 3000')
  });
});
