const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { verifyToken } = require("./middleware/verifyToken");
const connectToDb = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");
dotenv.config();

const app = express();
// helmet
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);
// cors policy
app.use(
  cors({
    origin: process.env.PRODUCTION_FRONTENDORIGIN,
    credentials: true,
  }),
);
// request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static folder
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/pdfs", verifyToken, express.static(path.join(__dirname, "pdfs")));

// apply middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// View engine
app.set("view engine", "ejs");

// routers
app.use("/api/books", require("./routes/books"));
app.use("/api/authors", require("./routes/authors"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/password", require("./routes/password"));

// error handler middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("failed to start server", error.message);
    process.exit(1);
  }
}
startServer();
