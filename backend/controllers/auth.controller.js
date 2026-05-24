import User from "../models/User.js";
import jwt from "jsonwebtoken";


const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register 
export const registerAdmin = async(req, res) => {
  try{
    const {username, password} = req.body;
    const userExists = await User.findOne({username});

    if(userExists){
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const user = await User.create({
      username, 
      password,
    });

    res.status(201).json({
      _id: user._id,
      token: generateToken(user._id),
    });
  }catch(error){
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// @desc    Login the user
// @route   POST /api/auth/login
export const loginAdmin = async(req, res) => {
  try{
    const {username, password} = req.body;
    const user = await User.findOne({username});

    if(user && (await user.matchPassword(password))){
      return res.status(200).json({
        _id: user._id,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({
      message: "Invalid credentials"
    });
  }catch(error){
    res.status(500).json({
      message: "Server Error"
    });
  }
};
