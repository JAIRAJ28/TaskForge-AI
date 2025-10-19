const mongoose = require("mongoose");

let cached = global.__mongoose_conn;
if (!cached) cached = global.__mongoose_conn = { conn: null, promise: null };
async function connectMongo() {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI || process.env.mongodbConnection;
  if (!uri) {
    throw new Error("Missing MONGODB_URI env");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      dbName: process.env.MONGODB_DB || undefined,
    }).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectMongo };
