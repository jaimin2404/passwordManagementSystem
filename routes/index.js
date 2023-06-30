var express = require("express");
var router = express.Router();
var userModule = require("../modules/user");
const userModel = require("../modules/user");
const categoryModel = require("../modules/category");
const passwordModel = require("../modules/password");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

// --------- functions ------
// ---check email already exist function
function checkEmail(req, res, next) {
  var email = req.body.email;
  var checkExistingEmail = userModel.findOne({ email: email });
  checkExistingEmail
    .then((data) => {
      if (data) {
        return res.render("signup", {
          title: "Sign up",
          message: "",
          error: "Email already exists",
        });
      }
      next();
    })
    .catch((err) => {
      throw err;
    });
}
// ---check username already exist function
function checkUsername(req, res, next) {
  var username = req.body.username;
  var checkExistingUsername = userModel.findOne({ username: username });
  checkExistingUsername
    .then((data) => {
      if (data) {
        return res.render("signup", {
          title: "Sign up",
          message: "",
          error: "Username already exists",
        });
      }
      next();
    })
    .catch((err) => {
      throw err;
    });
}
// check user is login or not function
function checkLoginUser(req, res, next) {
  var userToken = localStorage.getItem("userToken");
  try {
    var decoded = jwt.verify(userToken, "loginToken");
  } catch (error) {
    res.redirect("/");
  }
  next();
}

/* GET home page. */
// -------- login page ---------
router.get("/", function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  if (loginUser) {
    res.redirect("/dashbord");
  } else {
    res.render("index", { title: "Login", message: "", error: "" });
  }
});
router.post("/", function (req, res, next) {
  var username = req.body.username;
  var email = req.body.username;
  var password = req.body.password;

  var query = {
    $or: [{ username: username }, { email: email }],
  };
  var check = userModel.findOne(query);
  check
    .then((data) => {
      if (!data) {
        return res.render("index", {
          title: "index",
          message: "",
          error: "Invalid username or password",
        });
      }

      var getUserId = data._id;
      var getPassword = data.password;
      if (bcrypt.compareSync(password, getPassword)) {
        var token = jwt.sign({ userId: getUserId }, "loginToken");
        localStorage.setItem("userToken", token);
        localStorage.setItem("loginUser", username);
        res.redirect("/dashbord");
      } else {
        res.render("index", {
          title: "index",
          message: "",
          error: "Invalid username or password",
        });
      }
    })
    .catch((err) => {
      throw err;
    });
});
// -------- dashbord ------
router.get("/dashbord", checkLoginUser, async function (req, res, next) {
  try {
    const loginUser = localStorage.getItem("loginUser");
    const totalPassword = await passwordModel.countDocuments().exec();
    const totalPassCat = await passwordModel.countDocuments().exec();

    res.render("dashbord", {
      title: "Password Management System",
      loginUser: loginUser,
      msg: "",
      totalPassword: totalPassword,
      totalPassCat: totalPassCat,
    });
  } catch (err) {
    // Handle the error appropriately
    console.error(err);
    next(err);
  }
});

// ------  signup -----
router.get("/signup", function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  if (loginUser) {
    res.redirect("/dashbord");
  } else {
    res.render("signup", {
      title: "Password management system",
      message: "",
      error: "",
    });
  }
});
router.post("/signup", checkEmail, checkUsername, function (req, res, next) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  // convert password in bcrypt manner
  password = bcrypt.hashSync(req.body.password, 10);
  var userDetail = new userModule({
    username: username,
    email: email,
    password: password,
  });
  userDetail
    .save()
    .then((data) => {
      res.render("index", {
        title: "login",
        message: "User registered successfully",
        error: "",
      });
    })
    .catch((err) => {
      throw err;
    });
});

// ------  category -----
router.get("/category", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var perPage = 7;
  var page = req.params.page || 1;
  categoryModel
    .find()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec()
    .then((data) => {
      categoryModel
        .countDocuments({})
        .then((count) => {
          res.render("category", {
            title: "Category",
            loginUser: loginUser,
            records: data,
            dataDelete: "",
            id: "",
            current: page,
            pages: Math.ceil(count / perPage),
          });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
});

router.get("/category/:page", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var perPage = 7;
  var page = req.params.page || 1;
  categoryModel
    .find()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec()
    .then((data) => {
      categoryModel
        .countDocuments({})
        .then((count) => {
          res.render("category", {
            title: "Category",
            loginUser: loginUser,
            records: data,
            dataDelete: "",
            id: "",
            current: page,
            pages: Math.ceil(count / perPage),
          });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
});

// -- delete category
router.get("/category/delete/:id", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var categoryId = req.params.id;
  categoryModel
    .findByIdAndRemove(categoryId)
    .exec()
    .then(() => {
      return categoryModel.find().exec();
    })
    .then((data) => {
      res.render("category", {
        title: "Category",
        loginUser: loginUser,
        records: data,
        dataDelete: "Category deleted",
      });
    })
    .catch((err) => {
      throw err;
    });
});
// Edit category
router.get("/category/edit/:id", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var categoryId = req.params.id;
  categoryModel
    .findById(categoryId)
    .exec()
    .then((category) => {
      return categoryModel
        .find()
        .exec()
        .then((data) => {
          res.render("editCategory", {
            title: "Edit Category",
            loginUser: loginUser,
            records: data,
            errors: "",
            id: categoryId,
            category: category,
          });
        });
    })
    .catch((err) => {
      throw err;
    });
});
router.post("/category/edit/:id", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var categoryId = req.params.id;
  var categoryName = req.body.categoryName;
  categoryModel
    .findByIdAndUpdate(categoryId, { categoryname: categoryName })
    .exec()
    .then(() => {
      return categoryModel.find().exec();
    })
    .then((data) => {
      res.redirect("/category");
    })
    .catch((err) => {
      // Move the catch block inside the router.post function
      throw err;
    });
});

// ------ Add  category -----

router.get("/addCategory", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  res.render("addCategory", {
    title: "Category",
    loginUser: loginUser,
    errors: "",
    success: "",
  });
});
router.post(
  "/addCategory",
  checkLoginUser,
  [check("categoryName", "Enter Category name").isLength({ min: 1 })],
  function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("addCategory", {
        title: "Category",
        loginUser: loginUser,
        errors: errors.mapped(),
        success: "",
      });
    } else {
      var categoryName = req.body.categoryName;
      var categorydetail = new categoryModel({
        categoryname: categoryName,
      });
      categorydetail
        .save()
        .then((data) => {
          res.redirect("/category");
        })
        .catch((err) => {
          throw err;
        });
    }
  }
);

// ------  Password -----
router.get("/password", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var perPage = 7;
  var page = req.params.page || 1;

  passwordModel
    .find()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec()
    .then((data) => {
      passwordModel
        .countDocuments({})
        .then((count) => {
          res.render("password", {
            title: "Password",
            loginUser: loginUser,
            records: data,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
});

router.get("/password/:page", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var perPage = 7;
  var page = req.params.page || 1;

  passwordModel
    .find()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec()
    .then((data) => {
      passwordModel
        .countDocuments({})
        .then((count) => {
          res.render("password", {
            title: "Password",
            loginUser: loginUser,
            records: data,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
});

router.get("/password/edit/:id", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var id = req.params.id;
  passwordModel
    .findById({ _id: id })
    .exec()
    .then((data) => {
      categoryModel
        .find()
        .exec()
        .then((data1) => {
          res.render("editPassword", {
            title: "Password",
            loginUser: loginUser,
            record: data,
            records: data1,
            success: "",
          });
        });
    })
    .catch((err) => {
      throw err;
    });
});

router.post("/password/edit/:id", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var id = req.params.id;
  var passwordCategory = req.body.passwordCategory;
  var projectName = req.body.projectName;
  var passwordDetails = req.body.passwordDetail;
  passwordModel
    .findByIdAndUpdate(id, {
      passwordCategory: passwordCategory,
      projectName: projectName,
      passwordDetail: passwordDetails,
    })
    .exec()
    .then((data) => {
      categoryModel
        .find()
        .exec()
        .then((data1) => {
          res.redirect("/password");
        });
    })
    .catch((err) => {
      throw err;
    });
});

router.get("/password/delete/:id", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var id = req.params.id;
  passwordModel
    .findByIdAndDelete(id)
    .exec()
    .then(() => {
      return categoryModel.find().exec();
    })
    .then(() => {
      res.redirect("/password");
    })
    .catch((err) => {
      throw err;
    });
});

// ------ Add Password -----
router.get("/addPassword", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  categoryModel
    .find()
    .exec()
    .then((data) => {
      res.render("addPassword", {
        title: "Password",
        loginUser: loginUser,
        records: data,
        success: "",
      });
    })
    .catch((err) => {
      throw err;
    });
});
router.post("/addPassword", checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  var passwordCategory = req.body.passwordCategory;
  var projectName = req.body.projectName;
  var passwordDetail = req.body.passwordDetail;

  var passwordDetails = new passwordModel({
    passwordCategory: passwordCategory,
    passwordDetail: passwordDetail,
    projectName: projectName,
  });

  passwordDetails
    .save()
    .then(() => {
      res.redirect("/password");
    })
    .catch((err) => {
      throw err;
    });
});

// ------ logout --------
router.get("/logout", function (req, res, next) {
  localStorage.removeItem("userToken");
  localStorage.removeItem("loginUser");
  res.redirect("/");
});
module.exports = router;
