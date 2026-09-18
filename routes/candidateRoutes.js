const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("../models/candidate");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

//Post route to create a new candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res
        .status(403)
        .json({
          message: "Access denied. Only admin users can create candidates.",
        });
    const data = req.body;

    const newCandidate = new Candidate(data);
    await newCandidate.save();
    res
      .status(201)
      .json({
        message: "Candidate created successfully",
        candidate: newCandidate,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create candidate", error: err.message });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res
        .status(403)
        .json({
          message: "Access denied. Only admin users can update candidates.",
        });

    const candidateID = req.params.candidateID;
    const updatedData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedData,
      { new: true, runValidators: true },
    );
    res
      .status(200)
      .json({ message: "Candidate updated successfully", candidate: response });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update candidate", error: err.message });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res
        .status(403)
        .json({
          message: "Access denied. Only admin users can delete candidates.",
        });

    const candidateID = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete candidate", error: err.message });
  }
});

//lets start voting 

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
        const userID = req.user.id;
    try{
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: "Candidate not found" });
        }
        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        if(user.role == "admin"){
            return res.status(403).json({ message: "Admin users cannot vote" });
        }

        if(user.isVoted){
            return res.status(403).json({ message: "User has already voted" });
        }

        // Add the vote to the candidate's votes array
        candidate.votes.push({ user: userID });
        candidate.voteCount += 1;
        await candidate.save();

        // Update the user's isVoted field to true
        user.isVoted = true;
        await user.save();
        res.status(200).json({ message: "Vote cast successfully" });    

    } catch (err) {
        res.status(500).json({ message: "Failed to vote", error: err.message });
    }
});

module.exports = router;