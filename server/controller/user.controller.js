
import UserModel from "../model/user.js";


const getAllUsers = async (req, res) => {
  try {
    // const limit = parseInt(req.query._end, 10) || 10;
    const users = await UserModel.find({}).limit(req.query._end)

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }

};

const createUser = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const userExists = await UserModel.findOne({ email });

    if (userExists) { return res.status(200).json(userExists) }


    const newUser = await UserModel.create({ name, email, avatar })
    return res.status(201).json(newUser)

  } catch (error) {
    return res.status(500).json({ message: error.message })
  }

};

const getUserInfoByID = async (req, res) => {
  try {
    const { id } = req.params

    //Validated id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    //Find User data
    const user = await UserModel.findOne({ _id: id }).populate("allProperties")
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json(user);
    }

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

};

export {
  getAllUsers,
  createUser,
  getUserInfoByID

}
