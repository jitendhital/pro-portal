import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
     email:{
        type: String,
        required: true,
        unique: true
    },

     password:{
        type: String,
        required: true,
     },
     avatar:{
        type: String,
        default:"https://pixabay.com/illustrations/icon-profile-user-clip-art-7797704/"
     }
    }, {timestamps: true});

    const User= mongoose.model('User', userSchema)

    export default User;