import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Cart from '../models/Cart.js';
import mongoose from 'mongoose'

export const cod = async (req, res) => {
    try {
        const { products, address, paymentMode } = req.body;



        console.log("userID", req.user._id)
        console.log('produsts', products)
        console.log('address', address.fullName)
        console.log('paymentmode', paymentMode)

        if (paymentMode !== "COD") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment mode",
            });
        }


        if (!products || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No products found",
            });
        }


        const productIds = products.map((item) => item.productId);


        const dbProducts = await Product.find({
            _id: { $in: productIds },
        });


        if (dbProducts.length !== products.length) {
            return res.status(400).json({
                success: false,
                message: "One or more products not found",
            });
        }


        let itemsTotal = 0;

        const orderProducts = products.map((item) => {
            const product = dbProducts.find(
                (p) => p._id.toString() === item.productId
            );

            const quantity = Number(item.quantity);

            const price = product.salePrice ?? product.price;

            const itemTotal = price * quantity;

            itemsTotal += itemTotal;

            return {
                productId: product._id,
                quantity,
            };
        });


        const deliveryCharges = 0;

        const orderTotal = itemsTotal + deliveryCharges;


        const order = await Order.create({
            orderId: `ORD-${Date.now()}`,


            user: req.user?._id,

            products: orderProducts,

            itemsTotal,
            deliveryCharges,
            orderTotal,

            shippingAddress: {
                fullname: address.fullName,
                phone: address.phone,
                address: address.addressLine,
                city: address.city,
                state: address.state,
                postalCode: address.pincode,
                country: "India",
            },

            paymentStatus: "pending",
            paymentMode: "cod",
        });

        const clearcart = await Cart.updateOne(
            { user: req.user._id },
            {
                $pull: {
                    items: {
                        product: {
                            $in: products.map((item) => item.productId),
                        },
                    },
                },
            }
        );

        return res.status(201).json({
            success: true,
            message: "COD order created successfully",
            order,
        });
    } catch (error) {
        console.error("Create COD order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create COD order",
            error: error.message,
        });
    }
}

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                },
            },

            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },

            {
                $addFields: {
                    products: {
                        $map: {
                            input: "$products",
                            as: "orderProduct",

                            in: {
                                productId: "$$orderProduct.productId",
                                quantity: "$$orderProduct.quantity",

                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$productDetails",
                                                as: "product",
                                                cond: {
                                                    $eq: [
                                                        "$$product._id",
                                                        "$$orderProduct.productId",
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },

            {
                $project: {
                    productDetails: 0,
                },
            },

            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get user orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

export const getOrderById = async (req, res) => {

    const order = await Order.aggregate([
        {
            $match: {
                orderId: req.params.orderId,
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },

        {
            $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "productDetails",
            },
        },

        {
            $addFields: {
                products: {
                    $map: {
                        input: "$products",
                        as: "orderProduct",

                        in: {
                            $let: {
                                vars: {
                                    product: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$productDetails",
                                                    as: "p",
                                                    cond: {
                                                        $eq: [
                                                            "$$p._id",
                                                            "$$orderProduct.productId",
                                                        ],
                                                    },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                },

                                in: {
                                    productId: "$$orderProduct.productId",
                                    quantity: "$$orderProduct.quantity",
                                    name: "$$product.name",
                                    price: "$$product.price",
                                    salePrice: "$$product.salePrice",
                                    image: "$$product.image",
                                },
                            },
                        },
                    },
                },
            },
        },

        {
            $project: {
                productDetails: 0,
            },
        },
    ]);
}