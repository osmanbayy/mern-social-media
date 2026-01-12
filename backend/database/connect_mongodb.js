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
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    const opts = {
      bufferCommands: true, // Vercel'de timeout'u önlemek için true
      serverSelectionTimeoutMS: 10000, // 10 saniye server selection timeout
      socketTimeoutMS: 45000, // 45 saniye socket timeout
      connectTimeoutMS: 10000, // 10 saniye connection timeout
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`MongoDB connected - readyState: ${mongoose.connection.readyState}`);
      return mongoose;
    }).catch((error) => {
      cached.promise = null;
      console.error("MongoDB connection failed:", error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Bağlantının hazır olduğundan emin ol (bufferCommands: true olduğu için query'ler buffer'lanır)
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
      // Bağlantı kuruluyor veya bağlantı kesildi, tekrar bağlanmayı dene
      cached.promise = null;
      cached.conn = null;
      return connect_mongodb(); // Recursive call
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
