import mongoose from "mongoose";

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/skill-swap');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const userSchema = new mongoose.Schema({

  name: String,
  email: { type: String, unique: true },
  password: String,
  skillOffered: [String],
  skillsWanted: [String],
  profilePhoto: String,
  location: String,
  availability: String,
  isPublic: { type: Boolean, default: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }

});

export default mongoose.model("User", userSchema);
