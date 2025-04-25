const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
require('dotenv').config()
const users = require("../schema/userschema")

const Ad =require("../schema/adschema")

exports.getAllAds = async (req, res) => {
  console.log("inside get all ads" )
  try {
      const adds = await Ad.find();
      
      res.status(200).json(adds);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};



exports.createAd = async (req, res) => {

  try {
    const {
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
      userId
    } = req.body;

    const images = req.files?.map(file => `/profileImages/${file.filename}`) || [];

    const newAd = new Ad({
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
      images, // <-- Array of image paths
      userId // should be a MongoDB ObjectId
    });

    await newAd.save();

    return res.status(201).json({ message: "Ad posted successfully!", data: newAd });
  } catch (error) {
    console.error("Error posting ad:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};



const generateUserId = async () => {
  try {
    const highestUser = await users.findOne().sort({ userId: -1 }).select("userId"); // Get the highest userId
    console.log("high", highestUser)
    return highestUser ? highestUser.userId + 1 : 1000;

  } catch (error) {
    console.error("Error generating highest userId:", error);
    return null;
  }
};

exports.register = async (req, res) => {
  const user = req.body
  const { name, email, password } = user

  //console.log(user)//
  try {


    const existingUser = await users.findOne({ email: email })
    //console.log(existingUser)//
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
    console.log(existingUser)//
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
    console.log("userId", userId)

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

    console.log("Updated User:", updatedUser);
    return res.status(200).json({ message: "Profile updated successfully!", data: updatedUser });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: error.message });
  }
};

// exports.editAd = async (req, res) => {
//   try {
//     const adId = req.params.adId;

//     const {
//       category,
//       subcategory,
//       brand,
//       year,
//       fuel,
//       transmission,
//       kmDriven,
//       owners,
//       title,
//       description,
//       price,
//     } = req.body;

//     const images = req.files?.map(file => `/profileImages/${file.filename}`) || [];

//     const updateData = {
//       category,
//       subcategory,
//       brand,
//       year,
//       fuel,
//       transmission,
//       kmDriven,
//       owners,
//       title,
//       description,
//       price,
//     };

//     if (images.length > 0) {
//       updateData.images = images;
//     }

//     const updatedAd = await Ad.findByIdAndUpdate(
//       adId,
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedAd) {
//       return res.status(404).json({ message: "Ad not found" });
//     }

//     res.status(200).json({ message: "Ad updated successfully", data: updatedAd });
//   } catch (error) {
//     console.error("Error updating ad:", error);
//     res.status(500).json({ message: "Failed to update ad", error: error.message });
//   }
// };
