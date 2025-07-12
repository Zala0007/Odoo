import express from "express";
import { getSkills, createSkill } from "../controllers/skillController.js";
const router = express.Router();

router.get("/", getSkills);
router.post("/", createSkill);

export default router;