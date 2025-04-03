import mongoose from 'mongoose'

const connectDB = async (url) => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(url)
    .then(() => console.log(`mongoDB is connected`))
    .catch((error) => { console.log(error); console.log("Fail to Connect mongoDB"); })
}

export default connectDB