import mongoose from "mongoose";

// Vercel serverless functions için connection caching
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connect_mongodb = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`MongoDB connected`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error("Error connecting to MongoDB:", e.message);
    console.error("MongoDB URI exists:", !!process.env.MONGODB_URI);
    throw e;
  }

  return cached.conn;
};

export default connect_mongodb;
