const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticatedUser = catchAsyncError(async (req, resp, next) => {
    const { token } = req.cookies;
    
    if(!token){
        return next(new ErrorHandler("Please Login to Access this Resource", 401));
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodeData.id);
    next();
});

exports.authorizeRole = (...roles) => {
    return (req, resp, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role: ${req.user.role} is not allow to access this resource`, 403));
        }
        next();
    }
}