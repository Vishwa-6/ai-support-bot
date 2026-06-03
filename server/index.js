const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const knowledgeRoutes = require("./routes/knowledge");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(
  cors({
    origin: ["https://ai-support-bot-zeta.vercel.app",
    "https://ai-support-4lyogudfc-ai-support-bot.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/chat", chatRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Support Bot API is running!",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4,
  })
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });