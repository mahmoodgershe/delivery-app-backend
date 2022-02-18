const app = require("./app");

// mongoose

//    .connect(process.env.DB_STRING, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//    })
//    .then(() => console.log('connected to db'))
//    .catch((err) => console.log('error in database'));

const server = app.listen(process.env.PORT, (_) => {
  console.log(`running on port ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err);
  server.close(() => {
    process.exit(1);
  });
});
/* process.on('uncaughtException', (err) => {
  console.log(err.name, err.messsage);
  process.exit(1);
}); */
