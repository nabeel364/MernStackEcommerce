const catchAsyncError = require("../middleware/catchAsyncError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

exports.getPayment = catchAsyncError(async (req, resp, next) => {
    const idempotencyKey = uuidv4();
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "pkr",
        metadata: {
            company: "Ecommerce",
          },
    });
   
    resp.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
    });
});

exports.sendStripeApiKey = catchAsyncError(async (req, resp, next) => {
    resp.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY,
    })
});