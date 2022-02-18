const catchAsync = require("../helpers/catchAsync");
const validate = require("./validate");
const ValidationError = require("./ValidationsError");
const { ObjectId } = require("mongodb");
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////          INGREDIENT        ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

exports.createIngredientValidator = (req, res, next) => {
   const errors = validate({
      category_name: [
         req.body.ingredient_name,
         "arabicEnglishText",
         "Ingredient name name should be between 2 and 15 letters.",
         2,
         15,
      ],
   });

   if (errors.length) {
      return next(new ValidationError("Failed to validate ingredient feild.", errors));
   }

   next();
};
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////          CATEGORY        /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
exports.createCategoryValidator = (req, res, next) => {
   console.log(req.body);
   const errors = validate({
      category_name: [
         req.body.category_name,
         "arabicEnglishText",
         "category name should be between 3 and 15 letters.",
         3,
         15,
      ],
      color: [req.body.color, "hexcolor", "please provide hex type color."],
   });

   if (errors.length) {
      return next(new ValidationError("Failed to validate category feilds.", errors));
   }

   next();
};

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////          PRODUCTS        /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

exports.createProductValidator = catchAsync(async (req, res, next) => {
   const errors = validate({
      product_name: [req.body.product_name, "arabicEnglishText", "product name error", 3, 30],
      price: [req.body.price, "number", "price error", 0, 2000000],
      category_id: [req.body.category_id, "id", "Invalid category ID"],
      prepare_time: [req.body.prepare_time, "number", "Invalid time", 1, 2000],
   });

   if (
      !(await req.db
         .db()
         .collection("categories")
         .findOne({ _id: ObjectId(req.body.category_id) }))
   ) {
      if (!errors.includes("Invalid category ID")) errors.push("Invalid category ID");
   }

   let { ingredients } = req.body;
   ingredients = JSON.parse(ingredients);
   if (!Array.isArray(ingredients)) {
      errors.push("Invalid Ingredient format");
   } else {
      ingredients.forEach(el => {
         if (
            !(
               el.hasOwnProperty("name") &&
               new RegExp("^[\\u0621-\\u064Aa-zA-Z\\d\\-_\\s]{" + 2 + "," + 20 + "}").test(
                  el.name
               ) &&
               el.hasOwnProperty("quantity") &&
               typeof Number(el.quantity == "number") &&
               el.hasOwnProperty("unit") &&
               new RegExp("^[\\u0621-\\u064Aa-zA-Z\\d\\-_\\s]{" + 2 + "," + 20 + "}").test(el.unit)
            )
         ) {
            errors.push("Invalid Ingredient format");
         }
      });
   }
   if (req.body.description) {
      if (
         !new RegExp("^[\\u0621-\\u064Aa-zA-Z\\d\\-_\\s]{" + 3 + "," + 200 + "}").test(
            req.body.description
         )
      ) {
         errors.push("Description should be 5 letters at least");
      }
   }
   if (errors.length) {
      return next(new ValidationError("Failed to validate product feilds.", errors));
   }

   next();
});

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////       AUTHENTICATION     /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

exports.registerValidator = catchAsync(async (req, res, next) => {
   const { first_name, second_name, last_name, email, password, city, address, phone } = req.body;
   const errors = validate({
      first_name: [first_name, "text", "First name should be between 3 and 15 letters.", 3, 15],
      second_name: [second_name, "text", "Second name should be between 3 and 15 letters.", 3, 15],
      last_name: [last_name, "text", "Last name should be between 3 and 15 letters.", 3, 15],
      email: [email, "email", "Invalid email"],
      password: [password, "password", "Password should be 8 letters and numbers.", 8, 30],
      city: [city, "text", "City should be between 3 and 15 letters.", 3, 15],
      phone: [phone, "phone", "Invalid phone number (0997448813)"],
   });
   if (errors.length) {
      return next(new ValidationError("Validation Errors in register feilds", errors));
   }
   next();
});

exports.loginValidator = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;
   const errors = validate({
      email: [email, "email", "Invalid username or password"],
      password: [password, "password", "Invalid username or password", 8, 30],
   });

   if (errors.length) {
      return next(new ValidationError("Validation Errors in login feilds", errors));
   }
   next();
});

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////       ORDER     /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

exports.createOrderValidator = catchAsync(async (req, res, next) => {
   const { order_items } = req.body;

   if (!Array.isArray(order_items)) {
      return next(new ValidationError("a", ["error"]));
   } else {
      order_items.forEach(el => {
         if (
            !(
               el.hasOwnProperty("product_id") &&
               ObjectId.isValid(el.product_id) &&
               el.hasOwnProperty("quantity") &&
               typeof el.quantity == "number"
            )
         ) {
            return next(new ValidationError("Invalid orders object", ["Invalid orders object"]));
         }
      });
      next();
   }
});

exports.createAddressValidartor = catchAsync(async (req, res, next) => {
   const { longitude, latitude, address, note } = req.body;

   if (!note) {
      req.body.note = "لا توجد ملاحظة";
   }
   const errors = validate({
      longitude: ["number", longitude, "error in longitude"],
      latitude: ["number", latitude, "error in latitude"],
      address: ["arabicEnglishText", address, "error in address name", 3, 30],
   });

   if (errors.length) {
      return next(new ValidationError("Invalid address", errors));
   }
   next();
});
