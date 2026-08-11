import dns from 'dns'
dns.setDefaultResultOrder("ipv4first")
dns.setServers(["8.8.8.8", "8.8.4.4"])
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from './routes/auth.routes.js'
import dashboard from './routes/dashboard.routes.js'
import path from "path";
import adminProducts from './routes/admin.products.routes.js'
import userProducts from './routes/user.products.js'
import tagline from './routes/tagline.routes.js'
import cartRoutes from './routes/cart.routes.js'



dotenv.config();
// console.log({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// })

const app = express();






app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

const PORT = process.env.PORT || 5000;
connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/status', (req, res) => {
  res.send("working")
})
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboard)
app.use('/api/admin', adminProducts)
app.use('/api', tagline)
app.use('/api', cartRoutes)

app.use('/api', userProducts)






app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

