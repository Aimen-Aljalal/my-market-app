const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.mainPage = (req, res, next) => {
  res.render("mainPage");
};

exports.getSignup = (req, res, next) => {
  res.render("signup");
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        console.log(user);
        return res.status(422).send("Email already exists");
      }
      bcrypt
        .hash(password, 12)
        .then((hashedPass) => {
          const user = new User({
            email: email,
            password: hashedPass,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(() => {
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getlogin = (req, res, next) => {
  res.render("login");
};

exports.postlogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(422).send("Email or password is wrong");
    }
    bcrypt.compare(password, user.password).then((isEqual) => {
      if (isEqual) {
        req.session.isLogged = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      } else {
        return res.render("login");
      }
    });
  });
};
