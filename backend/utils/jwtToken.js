
// Create Token and Save in Cookie

const sendToken = (user, statusCode, resp) => {
    const token = user.getJwtToken();
    
    // options for Cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    resp.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    });
}

module.exports = sendToken;