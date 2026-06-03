const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Business = require("../models/Business");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { ownerName, businessName, email, password } = req.body;

    if (!ownerName?.trim() || !businessName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate email
    const existingEmail = await Business.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check duplicate business name
    const existingBusiness = await Business.findOne({
      businessName: {
        $regex: new RegExp(`^${escapeRegex(businessName.trim())}$`, "i"),
      },
    });
    if (existingBusiness) {
      return res.status(400).json({ message: "Business name already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const business = new Business({
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    await business.save();

    const token = jwt.sign(
      { id: business._id, businessName: business.businessName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registered successfully",
      token,
      business: {
        id: business._id,
        ownerName: business.ownerName,
        businessName: business.businessName,
        email: business.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const business = await Business.findOne({ email: email.trim().toLowerCase() });
    if (!business) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: business._id, businessName: business.businessName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      business: {
        id: business._id,
        ownerName: business.ownerName,
        businessName: business.businessName,
        email: business.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET BUSINESS NAME (public)
router.get("/business/:businessId", async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId).select(
      "businessName"
    );
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json({ businessName: business.businessName });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
