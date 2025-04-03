import mongoose from "mongoose";
import * as dotenv from "dotenv";
import PropertyModel from "../model/property.js";
import UserModel from "../model/user.js";
import { v2 as cloudinary } from "cloudinary"


dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const getAllProperties = async (req, res) => {

  const {
    _end,
    _order,
    _start,
    _sort,
    title_like = "",
    propertyType = ""
  } = req.body
  const query = {};
  if (title_like !== "") {
    query.title = { $regex: title_like, $options: "i" };
  }
  if (propertyType !== "") {
    query.propertyType = propertyType
  }

  try {
    const count = await PropertyModel.countDocuments({ query });
    const properties = await PropertyModel.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order === "asc" ? 1 : -1 });
    res.header("x-total-count", count)
    res.header("Access-Control-Expose-Header", "x-total-count")

    res.status(200).json(properties);


  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(`getAllProperties error :`, error);
  }

}

//Get Detail
const getPropertyDetail = async (req, res) => {
  const { id } = req.params;
  const propertyExits = await PropertyModel.findOne({ _id: id }).populate("creator");


  if (propertyExits) {
    res.status(200).json(propertyExits)
  } else {
    res.status(404).json({ message: "Property not found" })
  }

}

//Create Property1
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      location,
      price,
      photo,
      email
    } = req.body

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await UserModel.findOne({ email }).session(session);
    if (!user) throw new Error("User not found");

    // const photoUrl = await cloudinary.uploader.upload(photo);
    let photoUrl;
    try {
      photoUrl = await cloudinary.uploader.upload(photo);
    } catch (error) {
      return res.status(400).json({ message: "Failed to upload photo. Invalid URL or resource not found." });
    }
    const newProperty = new PropertyModel({
      title,
      description,
      propertyType,
      location,
      price,
      photo: photoUrl.url,
      creator: user._id
    });

    console.log('New Property:', newProperty); // Log the new property object
    await newProperty.save({ session });
    console.log('New property save');


    user.allProperties.push(newProperty._id)
    await user.save({ session });


    await session.commitTransaction();
    session.endSession();
    console.log('Session ended');

    res.status(200).json({ message: "Property created" })

  } catch (error) {

    res.status(500).json({ message: error.message })

  }
}

//Create Property2
// const createProperty = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       propertyType,
//       location,
//       price,
//       photo,
//       email
//     } = req.body;

//     // Start a session
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     // Check if user exists
//     const user = await UserModel.findOne({ email }).session(session);
//     if (!user) throw new Error("User not found");

//     // Upload photo to Cloudinary
//     const photoUrl = await cloudinary.uploader.upload(photo);

//     // Create and save the property
//     const newProperty = await PropertyModel.create([{
//       title,
//       description,
//       propertyType,
//       location,
//       price,
//       photo: photoUrl.url,
//       creator: user._id
//     }], { session });

//     // Update user's property list
//     user.allProperties.push(newProperty[0]._id);
//     await user.save({ session });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({ message: "Property created successfully!" });

//   } catch (error) {
//     console.error("Error creating property:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



//Update Property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      propertyType,
      location,
      price,
      photo,
      email
    } = req.body

    const photoUrl = await cloudinary.uploader.upload(photo);

    await PropertyModel.findByIdAndUpdate(
      { _id: id },
      {
        title,
        description,
        propertyType,
        location,
        price,
        photo: photoUrl.url || photo
      }
    );
    res.status(200).json({ message: "Property updated" })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//Delete property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyExits = await PropertyModel.findById({ _id: id }).populate("creator");
    if (!propertyExits) throw new Error("User not found");
    const session = await mongoose.startSession();
    session.startTransaction()

    await PropertyModel.deleteOne({ _id: id }, { session })
    propertyExits.creator.allProperties.pull(propertyExits)

    await propertyExits.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Property deleted" })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export {

  getAllProperties,
  getPropertyDetail,
  createProperty,
  updateProperty,
  deleteProperty,
}