import mongoose from "mongoose";

const connect_mongodb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error("Error connection to MongoDB", error.message);
    process.exit(1);
  }
};

export default connect_mongodb;
