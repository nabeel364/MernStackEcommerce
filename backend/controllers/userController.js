const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

// Register a User
exports.registerUser = catchAsyncError(async (req, resp, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    });

    sendToken(user, 201, resp);
});

// Login User
exports.loginUser = catchAsyncError(async (req, resp, next) => {

    const { email, password } = req.body;

    // Checking if User has given Email and Passwprd both
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const ispasswordMatched = await user.comparePassword(password);
    if (!ispasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken(user, 200, resp);
    
});

// Logout User
exports.logout = catchAsyncError(async (req, resp, next) => {

    resp.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    resp.status(200).json({
        success: true,
        message: "Logout"
    })
});

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, resp, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Get Reset Password Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswprdUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswprdUrl} \n\n 
    if you have not requested this email then please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message
        });

        resp.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncError(async (req, resp, next) => {

    // Creating Token Hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Reset Password Token is Invalid or has been expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, resp);
});

// GET USER DETAILS
exports.getUserDetails = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.user.id);
    
    resp.status(200).json({
        success: true,
        user,
    });
})

// UPDATE USER PASSWORD
exports.updateUserPassword = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const ispasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!ispasswordMatched) {
        return next(new ErrorHandler("Old Password is Incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, resp);
})

// UPDATE USER PROFILE
exports.updateUserProfile = catchAsyncError(async (req, resp, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if(req.body.avatar !=="") {
        const user = await User.findById(req.user.id);
        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    resp.status(200).json({
        success: true
    })
});

// GET ALL USERS (ADMIN)
exports.getAllUsers = catchAsyncError(async (req, resp, next) => {

    const users = await User.find();

    resp.status(200).json({
        success: true,
        users
    });
});

// GET SINGLE USERS DETAILS (ADMIN)
exports.getSingleUser = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }

    resp.status(200).json({
        success: true,
        user
    });
});

// UPDATE USER ROLE (ADMIN)
exports.updateUserRole = catchAsyncError(async (req, resp, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    
    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    resp.status(200).json({
        success: true
    })
});

// DELETE USER (ADMIN)
exports.deleteUser = catchAsyncError(async (req, resp, next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    resp.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    })
});