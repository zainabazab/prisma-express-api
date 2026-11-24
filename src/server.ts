import express from "express";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
const app = express();
const PORT = 5000;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Prisma Express API is running!",
  });
});

// User routes
app.use("/api/users", userRoutes);
// Product routes
app.use("/api/products", productRoutes);
// Order routes
app.use("/api/orders", orderRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});