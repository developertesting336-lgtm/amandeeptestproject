import express from 'express'
import {getHomeTaglines} from '../controllers/admin.tagline.controller.js'
import { getProducts } from '../controllers/user.products.js';
import { getFeaturedProducts } from '../controllers/featured.product.js';
const router = express.Router();

router.get("/featured", getFeaturedProducts);
router.get("/hometaglines", getHomeTaglines);
router.get("/products", getProducts);

export default router