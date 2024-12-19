import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: true,
    },
});

const User = mongoose.model('User', userSchema);

export default User;
