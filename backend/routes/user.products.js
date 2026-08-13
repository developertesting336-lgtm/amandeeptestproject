import express from 'express'
import { getHomeTaglines } from '../controllers/admin.tagline.controller.js'
import { getProducts } from '../controllers/user.products.js';
import { getFeaturedProducts } from '../controllers/featured.product.js';
import { getCategories } from '../controllers/category.controller.js';
const router = express.Router();

router.get("/featured", getFeaturedProducts);
router.get("/hometaglines", getHomeTaglines);
router.get("/products", getProducts);
// router.get("/categories",getCategories)

export default router