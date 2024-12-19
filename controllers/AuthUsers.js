import bcrypt from 'bcryptjs';
import User from '../models/DB.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = '838989jnjdjkj'; // Replace with your actual secret key



export const checkEmail = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'Email not found' });
      }
  
      res.status(200).json({ message: 'Email exists' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

export const addUser = async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password ) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            SECRET_KEY,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send the token and user information in the response
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user', error });
    }
};



export const getUser = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password are required' });
    }

    try {
        // Check if user exists in the database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token (you can set an expiry time for the token)
        const token = jwt.sign(
            { userId: user._id, email: user.email }, // Payload
            '838989jnjdjkj', // Secret key (change to a real secret)
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send the token as a response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                fullname: user.fullname,
                email: user.email,
                password: user.password
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during login', error });
    }
};


export const setNewPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Find the user and update the password
        const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update password', error: err.message });
    }
};
