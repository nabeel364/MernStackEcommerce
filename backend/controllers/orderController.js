const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');

// Create New Order
exports.newOrder = catchAsyncError(async (req, resp, next) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    });

    resp.status(201).json({
        success: true,
        order
    })
});

// Get Single Order
exports.getSingleOrder = catchAsyncError(async (req, resp, next) => {

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404));
    }

    resp.status(200).json({
        success: true,
        order
    })
});

// Get Logged In User Orders
exports.myOrders = catchAsyncError(async (req, resp, next) => {

    const orders = await Order.find({ user: req.user._id });

    resp.status(200).json({
        success: true,
        orders
    })
});

// Get All Orders (Admin)
exports.getAllOrders = catchAsyncError(async (req, resp, next) => {

    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    })

    resp.status(200).json({
        success: true,
        totalAmount,
        orders
    })
});

// Update Orders Status (Admin)
exports.updateOrder = catchAsyncError(async (req, resp, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 404));
    }

   if(req.body.status === "Shipped") {
    order.orderItems.forEach(async (order) => {
        await updateStock(order.product, order.quantity);
    });
   }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    resp.status(200).json({
        success: true
    })
});

async function updateStock(id, quantity){

    const product = await Product.findById(id);
    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false });
};

// Delete Orders (Admin)
exports.deleteOrder = catchAsyncError(async (req, resp, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404));
    }
    await order.remove();

    resp.status(200).json({
        success: true
    })
});