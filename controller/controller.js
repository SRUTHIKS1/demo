const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
require('dotenv').config()
const users = require("../schema/userschema")
const crypto=require("crypto")


const Ad =require("../schema/adschema");
const { Resend } = require('resend');

exports.getAllAds = async (req, res) => {
  // console.log("inside get all ads" )
  try {
      const adds = await Ad.find();
      
      res.status(200).json(adds);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};



exports.createAd = async (req, res) => {
  try {
    const { category, subcategory, brand, year, fuel, transmission, kmDriven, owners, title, description, price, userId,location } = req.body;

    const images = req.files?.map(file => `/profileImages/${file.filename}`) || [];
    const adId = await generateProductId();
    console.log(adId);

    const newAd = new Ad({
      adId,
      location,
      category,
      subcategory,
      brand,
      year,
      fuel,
      transmission,
      kmDriven,
      owners,
      title,
      description,
      price,
      images,
      userId
    });

    await newAd.save();
    return res.status(201).json({ message: "Ad posted successfully!", data: newAd });
  } catch (error) {
    console.error("Error posting ad:", error);
    return res.status(500).json({ message: "Error posting ad", error: error.message });
  }
};


const generateUserId = async () => {
  try {
    const highestUser = await users.findOne().sort({ userId: -1 }).select("userId"); // Get the highest userId
    // console.log("high", highestUser)
    return highestUser ? highestUser.userId + 1 : 1000;

  } catch (error) {
    console.error("Error generating highest userId:", error);
    return null;
  }
};

exports.register = async (req, res) => {
  const user = req.body
  const { name, email, password } = user

  console.log(user)//
  try {


    const existingUser = await users.findOne({ email: email })
    console.log(existingUser)//
    if (existingUser) {
      return res.status(406).json('account already exist')
    }
    // Get highest userId and increment
    const highestUserId = await generateUserId();
    const newUserId = highestUserId + 1;
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new users({
      userId: newUserId,
      name,
      email,
      address: "",
      contact: "",
      location: "",
      password: hashedPassword,
    })

    await newUser.save()
    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(401).json(error)
  }
}


exports.login = async (req, res) => {
  const user = req.body
  const { email, password } = user
  //console.log(user)//
  try {
    const existingUser = await users.findOne({ email: email })
    // console.log(existingUser)//
    if (!existingUser) {
      return res.status(400).json("user not found")
    }
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      return res.status(400).json("invalid")
    }
    const secretKey = process.env.JWT_SECRET
    const token = jwt.sign({ email: existingUser.email }, secretKey, { expiresIn: '1h' })
    return res.status(200).json({ userDetails: existingUser, token })


    // } else {

    //     const newUser = new users({ username, email, password })
    //     await newUser.save()
    //     res.status(200).json(newUser)


    // }
  } catch (error) {
    res.status(401).json(error)
  }
}

exports.getUser = async (req, res) => {

  try {
    const userId = Number(req.params.userId)
    // console.log("userId", userId)

    const existingUser = await users.findOne({ userId })
    //console.log(existingUser)//
    if (!existingUser) {
      return res.status(400).json("user not found")
    }
    else if (existingUser) {
      return res.status(200).json({ message: "success", data: existingUser })
    }

  } catch (error) {
    res.status(401).json(error)
  }
}


exports.editUser = async (req, res) => {
  try {

    const userId = Number(req.params.userId);
    // console.log("Updating user with ID:", userId, "Request Body:", req.body);

    const imageUrl = req.file ? `/profileImages/${req.file.filename}` : null;

    const existingUser = await users.findOne({ userId });

    if (!existingUser) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      ...(imageUrl ? { Image: imageUrl } : {}),
      name: req.body.name,
      address: req.body.address,
      location: req.body.location,
      contact: req.body.contact,
    };
    
    const updatedUser = await users.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      console.error("Database update failed for user:", userId);
      return res.status(500).json({ message: "Error updating profile" });
    }

    // console.log("Updated User:", updatedUser);
    return res.status(200).json({ message: "Profile updated successfully!", data: updatedUser });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: error.message });
  }
};
exports.updateAd = async (req, res) => {
  try {
    const adId = req.params.adId;  // Ensure you're correctly accessing the adId in the request params
    // console.log("Updating ad with ID:", adId);
    
    const updateData = { ...req.body };
    
    if (req.files) {
      const imagePaths = req.files.map(file => `/profileImages/${file.filename}`);
      updateData.images = imagePaths;
    }

    const updatedAd = await Ad.findOneAndUpdate({ adId }, updateData, { new: true });

    if (!updatedAd) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.status(200).json(updatedAd);
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
};

const generateProductId = async () => {
  try {
      const lastAd = await Ad.findOne().sort({ adId: -1 });
      const newProductId = lastAd ? lastAd.adId + 1 : 1000;
      return newProductId;
  } catch (error) {
      console.error("Error generating ProductId:", error);
      throw new Error("Failed to generate ProductId");
  }
};

exports.getAdById = async (req, res) => {
  // console.log("inside get ad by id");
  try {
    const { adId } = req.params;
    
    const ad = await Ad.findOne({ adId });  // Using adId for searching

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    res.status(200).json(ad);
  } catch (err) {
    console.error("Error fetching ad by ID:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.searchItem = async (req, res) => {
  try {
    const query = req.params.query ; // Depending on your route setup
    // console.log("Search query:", query);

    if (!query) return res.json({ items: [] });

    const items = await Ad.find({
      $or: [
        { subcategory: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search items!' });
  }
};

exports.searchByLocation = async (req, res) => {
  try {
    const locationQuery = req.params.location;

    if (!locationQuery) return res.json({ items: [] });

    const items = await Ad.find({
      location: { $regex: locationQuery, $options: 'i' }  // case-insensitive search
    });

    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search by location!' });
  }
};


exports.deleteAd = async (req, res) => {
  try {
    const { adId } = req.params;

    const deletedAd = await Ad.findOneAndDelete({ adId });

    if (!deletedAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.status(200).json({ message: "Ad deleted successfully", data: deletedAd });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ error: "Failed to delete ad" });
  }
};


exports.getUsersAds = async (req, res) => {
  try {
    const userId = req.params.userId; // ✅ Don't convert to Number
    console.log("userId", userId);

    const existingAds = await Ad.find({ userId }); // or { postedBy: userId } if that's the correct field
    console.log(existingAds);

    if (!existingAds || existingAds.length === 0) {
      return res.status(404).json("Ads not found");
    }

    return res.status(200).json({ message: "success", data: existingAds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("email:", email);

    const user = await users.findOne({ email });
    console.log("user:", user);

    // Always send same response to avoid exposing valid emails
    res.status(200).send('If user exists, email will be sent.');

    if (!user) return; // Stop if no user found

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Save hashed token and expiry to DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:5173/resetPassword/${token}`;

    // Send email
    const resend = new Resend('re_SUEcK81p_8KMG2sSe8MbLUxtpB9DXp1GS');
    try {
      
     const{data,error}= await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Reset Password',
        html: `<p>This is the link to reset your password:<br/><a href="${resetLink}">${resetLink}</a></p>`
      });
      console.log("data:",data);
      console.log("error:",error)
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Optionally: log or alert admin
    }

  } catch (error) {
    console.error("Forgot password failed:", error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params; // Token from URL
  const { password } = req.body; // New password from the request body

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await users.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and remove reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};




exports.getUserFavorites = async (req, res) => {
    try {
        // console.log("userid1", req)
        const userId = Number(req.params.userId);

        console.log("userid", userId)

        const existingUser = await users.findOne({ userId })

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("result", existingUser.favorites);
        console.log(typeof (existingUser.favorites));

       const favoriteAdIds = existingUser.favorites.map(Number);

        const favoriteAds = await Ad.find({
            adId: { $in: favoriteAdIds }
        });




        console.log("ADS", favoriteAds);
        res.status(200).json({ favorites: favoriteAds });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.addToFavorites = async (req, res) => {
    try {
        const userId = req.body.userId;
        const adId = Number(req.body.adId);
        console.log("userid", userId, "addid", adId)

        const existingUser = await users.findOne({ userId: userId });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (existingUser.favorites.includes(adId)) {
            return res.status(400).json({ message: 'Product already in favorites' });
        }

        const updatedUser = await users.findOneAndUpdate(
            { userId: userId },
            { $addToSet: { favorites: adId } },
            { new: true }
        );

        res.status(200).json({
            message: 'Product added to favorites',
            favorites: updatedUser.favorites
        });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
    try {
        const { userId, adId } = req.body;

        if (!userId || !adId) {
            return res.status(400).json({ message: 'userId and adId are required' });
        }

        const user = await users.findOne({ userId: Number(userId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out the adId (string comparison)
        user.favorites = user.favorites.filter(favId => favId !== adId);
        await user.save();

        res.status(200).json({ 
            message: 'Removed from favorites',
            favorites: user.favorites 
        });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
