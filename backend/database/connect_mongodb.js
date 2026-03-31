import mongoose from "mongoose";
import Message from "../models/message_model.js";

const connect_mongodb = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected`);

    try {
      await Message.collection.updateMany(
        { readReceipt: { $exists: false }, read: { $exists: true } },
        [{ $set: { readReceipt: "$read" } }]
      );
      await Message.collection.updateMany(
        { readReceipt: { $exists: false } },
        { $set: { readReceipt: false } }
      );
      await Message.collection.updateMany({ read: { $exists: true } }, { $unset: { read: "" } });
    } catch (mErr) {
      console.log("Message readReceipt migration (atlas uyumluluk):", mErr.message);
    }
  } catch (error) {
    console.error("Error connecting to MongoDB", error.message);
    throw error;
  }
};

export default connect_mongodb;
