const Profile = require("../models/Profile");

// @desc    Get a user profile (by email) or return a default profile
// @route   GET /api/profile?email=...
// @access  Public
const getProfile = async (req, res) => {
  try {
    const { email } = req.query;

    if (email) {
      const user = await Profile.findOne({ email });
      if (user) {
        return res.status(200).json({
          success: true,
          data: user,
        });
      }
    }

    // Return a default/demo profile when no saved profile exists
    const defaultProfile = {
      name: "Arjun Mehta",
      email: "arjun.mehta@evocodes.com",
      picture:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      role: "Operations Director",
      department: "Enterprise Suite",
      location: "Chennai, Tamil Nadu, India",
      phone: "+91 98765 43210",
      company: "EvoCodes Pvt. Ltd.",
      joined: "January 2022",
      bio: "Product-minded operations leader who loves turning complex workflows into simple, elegant systems. Focused on scaling enterprise teams with data-driven decisions.",
      skills: [
        { name: "ERP Strategy", level: 92, color: "bg-blue-600" },
        { name: "Process Automation", level: 84, color: "bg-emerald-500" },
        { name: "Data Analytics", level: 90, color: "bg-violet-500" },
        { name: "Team Leadership", level: 88, color: "bg-amber-500" },
        { name: "Vendor Management", level: 76, color: "bg-cyan-500" },
      ],
      languages: [
        "English (Fluent)",
        "Tamil (Native)",
        "Hindi (Conversational)",
      ],
    };

    res.status(200).json({
      success: true,
      data: defaultProfile,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: err.message,
    });
  }
};

// @desc    Save (create or update) a user profile
// @route   PUT /api/profile
// @access  Public
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      picture,
      role,
      department,
      location,
      phone,
      company,
      joined,
      bio,
      skills,
      languages,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to identify the profile",
      });
    }

    const profileData = {
      name,
      email,
      picture,
      role,
      department,
      location,
      phone,
      company,
      joined,
      bio,
      skills,
      languages,
    };

    // Upsert: create if the profile doesn't exist, otherwise update
    const user = await Profile.findOneAndUpdate({ email }, profileData, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: user,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A profile with this email already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to save profile",
      error: err.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
