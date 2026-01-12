import mongoose from "mongoose";

// Vercel serverless functions için connection caching
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connect_mongodb = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      if (mongoose.connection.readyState === 1) {
        return cached.conn;
      }
    } catch (e) {
      cached.promise = null;
      cached.conn = null;
      throw e;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`MongoDB connected - readyState: ${mongoose.connection.readyState}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;

    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) {
          resolve();
        } else {
          mongoose.connection.once('connected', resolve);
        }
      });
    }

    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error("Error connecting to MongoDB:", e.message);
    console.error("MongoDB URI exists:", !!process.env.MONGODB_URI);
    throw e;
  }
};

export default connect_mongodb;
