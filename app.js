const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");

//
const { MongoClient,ServerApiVersion } = require("mongodb");
const localUri = "mongodb://localhost/resturantapptest";
const uri =
  "mongodb+srv://mahmood:9973106236114mm@cluster0.l5qtv.mongodb.net/DeliveryApp?retryWrites=true&w=majority";
const db = new MongoClient(uri, {
  useNewUrlParser: true,
  serverApi: ServerApiVersion.v1 ,
  useUnifiedTopology: true,
});
//
require("dotenv").config();
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const bookmarkRoutes = require("./routes/bookmarks");
const addressRoutes = require("./routes/addresses");
const { errorHandler } = require("./helpers/errorHandler");
const AppError = require("./helpers/appError");
const app = express();
app.use(express.static("public"));
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(async (req, res, next) => {
  req.db = await db.connect();
  next();
});

// app.use("/api/v1/images", express.static(__dirname + "/public/"));
//points : embeded documents.
//search : search strings embeded.
// delete $pull: {search: string}
/* 

{
  point : [,],
  name: '',

}
*/
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/bookmarks", bookmarkRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/addresses", addressRoutes);

app.all("*", notFound);
app.use(errorHandler);

function notFound(req, res, next) {
  const err = new AppError("Invalid endpoint", 404);
  next(err);
}
module.exports = app;
