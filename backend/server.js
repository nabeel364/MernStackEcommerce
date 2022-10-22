const app = require('./app');
const cloudinary = require('cloudinary');
const connectDatabase = require('./config/database');

// Handling Uncaught Exception
process.on("uncaughtException", (error)=>{
    console.log(`Error: ${error.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);

    process.exit(1);
})

// Config
if(process.env.NODE_ENV !== "PRODUCTION") {
    require('dotenv').config();
}

const port = process.env.PORT;

// Connecting to database
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const server = app.listen(port, ()=>{
    console.log(`Server is working on http://localhost: ${port}`);
});


// Unhandled  Promise Rejection
process.on("unhandledRejection", error=>{
    console.log(`Error: ${error.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(()=>{
        process.exit(1);
    })
})