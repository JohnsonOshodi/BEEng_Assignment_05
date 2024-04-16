const mongoose = require("mongoose")

const connectDB = async() => {
    try {

        await mongoose.connect("mongodb+srv://johnsonoshodi2:Drowss@P@cluster0.yptrt0f.mongodb.net/")
        .then(console.log("MongoDB connected"))


    } catch (error){
        console.log(error.message)
    
    }
}

module.exports = connectDB




