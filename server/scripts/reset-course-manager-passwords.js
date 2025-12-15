// scripts/reset-course-manager-passwords.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config(); // load MONGO_URI from .env

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("Please set MONGO_URI in environment (e.g. MONGO_URI=mongodb://...)");
  process.exit(1);
}

// Minimal user model for updating password_hash
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("NG_User_temp_for_pw", userSchema, "ng_users");

const resets = [
  // { login_id: "neha", plain: "Neha@123" },
  // { login_id: "rohan", plain: "Rohan@123" },
  { login_id: "simran", plain: "Simran@123" },
];

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to Mongo");

  for (const r of resets) {
    const user = await User.findOne({ login_id: r.login_id }).lean();
    if (!user) {
      console.warn("User not found:", r.login_id);
      continue;
    }

    const newHash = await bcrypt.hash(r.plain, 10);
    const res = await User.updateOne(
      { _id: user._id },
      { $set: { password_hash: newHash }, $unset: { password: "" } } // remove any plaintext password field
    );
    console.log(`Updated ${r.login_id}: matched=${res.matchedCount || res.n} modified=${res.modifiedCount || res.nModified}`);
  }

  await mongoose.disconnect();
  console.log("Done, disconnected");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
