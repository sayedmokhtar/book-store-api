const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { imagesDir, pdfDir } = require("./config/uploadPaths");
const { verifyToken } = require("./middleware/verifyToken");
const connectToDb = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");

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
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      process.env.PRODUCTION_FRONTEND_ORIGIN,
    ].filter(Boolean),
    credentials: true,
  }),
);
// request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static folder
app.use("/images", express.static(imagesDir));
app.use("/pdfs", verifyToken, express.static(pdfDir));

// View engine
app.set("view engine", "ejs");

// routers
app.use("/api/books", require("./routes/books"));
app.use("/api/authors", require("./routes/authors"));
app.use("/api/test", (req, res) => {
  return res.status(200).json({ message: "backend is working" });
});
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
