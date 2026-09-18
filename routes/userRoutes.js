const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

router.post("/signup", async (req, res) => {
    try {
        const {
            username,
            age,
            email,
            mobile,
            address,
            aadharCardNumber,
            password
        } = req.body;

        // 1. Validate Aadhaar
        if (!/^\d{12}$/.test(aadharCardNumber)) {
            return res.status(400).json({
                message: "Aadhar Card Number must have exactly 12 digits."
            });
        }

        // 2. Check duplicate Aadhaar
        const existingUser = await User.findOne({ aadharCardNumber });

        if (existingUser) {
            return res.status(400).json({
                message: "A user with the same Aadhar Card Number already exists."
            });
        }

        // 3. Create user
        const newUser = new User({
            username,
            age,
            email,
            mobile,
            address,
            aadharCardNumber,
            password
        });

        // 4. Save user in MongoDB
        await newUser.save();

        // 5. Generate JWT
        const payload = {
            id: newUser.id
        };

        const token = generateToken(payload);

        // 6. Send response
        res.status(201).json({
            message: "User created successfully",
            token
        });

    } catch (error) {
        console.log("SIGNUP ERROR:", error);

        res.status(500).json({
            message: "Signup failed",
            error: error.message
        });
    }
});

router.post("/login", async (req, res) => {
  try {
    // Extract aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    const user = await User.findOne({ aadharCardNumber });

    // Check if aadharCardNumber or password is missing
    if (!aadharCardNumber || !password) {
      return res
        .status(400)
        .json({ message: "Aadhar Card Number and password are required." });
    }

    //Generate a token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    // return token as response
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed", error });
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in the token payload
    const user = await User.findById(userId);
    const userData = req.user; // Assuming the user data is stored in req.user by the jwtAuthMiddleware
    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in the token payload
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required." });
    }

    const user = await User.findById(userId);
    const isMatch = await user.comparePassword(oldPassword);
    if (!user || !isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password", error });
  }
});

//vote count
router.get("/vote-count", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    const voteRecords = candidate.map((candidate) => {
      return {
        party: candidate.party,
        count: candidate.voteCount,
      };
    });

    res.status(200).json({ voteRecords });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vote count", error });
  }
});

router.get('/', async (req,res)=>{
    try{
        const candidates = await Candidate.find({}, 'name party -_id');
        res.status(200).json({candidates})
    } catch(err){
        res.status(500).json({message: "Failed to fetch users", error: err.message})
    }
})
module.exports = router;
