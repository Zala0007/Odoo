import Skill from "../models/Skill.js";

export const getSkills = async (req, res, next) => {
    try {
        const skills = await Skill.find();
        res.json(skills);
    } catch (err) {
        next(err);
    }
};

export const createSkill = async (req, res, next) => {
    try {
        const skill = await Skill.create(req.body);
        res.status(201).json(skill);
    } catch (err) {
        next(err);
    }
};