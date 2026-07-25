const express = require("express");
const dotenv = require("dotenv").config();
const connectToDb = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");
const mongoose = require("mongoose");

// connection to database
connectToDb();
const app = express();
app.use(express.json());

// routers
app.use("/api/books", require("./routes/books"));
app.use("/api/authors", require("./routes/authors"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// error handler middleware
app.use(notFound);
app.use(errorHandler);
const port = process.env.port;
app.listen(port, () =>
  console.log(
    `server is running in ${process.env.NODE_ENV} mode on port ${port}`,
  ),
);
