import mongoose from "mongoose";

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/skill-swap');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const skillSchema = new mongoose.Schema({
  name: String,
  category: String
});

export default mongoose.model("Skill", skillSchema);