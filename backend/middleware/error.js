const ErrorHandler = require('../utils/errorHandler');

module.exports = (error, req, resp, next)=>{
    error.statusCode = error.statusCode || 500;
    error.message = error.message || "Internal Server Error";

    // Wrong Mongodb CastError(id)
    if(error.name === "CastError"){
        const message = `Resource Not Found. Invalid: ${error.path}`;
        error = new ErrorHandler(message, 400);
    }

    // Mongoose Duplicate Key Error
    if(error.code === 11000){
        const message = `Duplicate ${Object.keys(error.keyValue)} Entered`;
        error = new ErrorHandler(message, 400);
    }

    // WRONG JWT TOKEN
    if(error.name === "JsonWebTokenError"){
        const message = `Json Web Token is Invalid, try again`;
        error = new ErrorHandler(message, 400);
    }

    // JWT EXPIRE ERROR
    if(error.name === "TokenExpiredError"){
        const message = `Json Web Token is Expired, try again`;
        error = new ErrorHandler(message, 400);
    }

    resp.status(error.statusCode).json({
        success:false,
        message: error.message,
    })
}