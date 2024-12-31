import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const login = async (req, res) => {
    try {
      console.log("Login endpoint called");
      const { email, password } = req.body;
  
      console.log("Finding user in database...");
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, error: "User not Found" });
      }
  
      console.log("Verifying password...");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: "Wrong Password" });
      }
  
      console.log("Generating JWT token...");
      const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: "10d" }
      );
  
      console.log("Login successful");
      res.status(200).json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, role: user.role },
      });
    } catch (error) {
      console.error("Error in login:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

const verify = (req, res) => {
    res.status(200).json({success: true, user: req.user} )
}

export {login, verify}