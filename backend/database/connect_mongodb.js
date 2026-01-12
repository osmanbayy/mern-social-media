import mongoose from "mongoose";

const connect_mongodb = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error("Error connecting to MongoDB", error.message);
    throw error;
  }
};

export default connect_mongodb;
