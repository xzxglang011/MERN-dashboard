import express from 'express'
import * as dotenv from 'dotenv'
import cors from "cors"
import connectDB from './mongodb/connect.js'
import userRouter from './routes/user.routes.js'
import propertyRouter from "./routes/property.routes.js"
dotenv.config()

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }))

app.get("/", (req, res) => {
  res.send(`Welcome to MyAPI`)
})

app.use("/api/v1/users", userRouter)
app.use("/api/v1/properties", propertyRouter)


const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL)

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    })

  } catch (error) {
    console.log(error);

  }
}

startServer()