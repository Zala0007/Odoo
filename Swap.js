import mongoose from "mongoose";

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/skill-swap');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const swapSchema = new mongoose.Schema({

    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    skillRequested: String,
    skillOffered: String,

    status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled"], default: "pending" },
    feedback: String,
    rating: Number
    
}, { timestamps: true });

export default mongoose.model("Swap", swapSchema);
