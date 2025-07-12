import Swap from "../models/Swap.js";

export const createSwap = async (req, res, next) => {
  try {
    const swap = await Swap.create({ ...req.body, requester: req.userId });
    res.status(201).json(swap);
  } catch (err) {
    next(err);
  }
};

export const getSwaps = async (req, res, next) => {
  try {
    const swaps = await Swap.find({ $or: [{ requester: req.userId }, { recipient: req.userId }] }).populate("requester recipient");
    res.json(swaps);
  } catch (err) {
    next(err);
  }
};

export const updateSwapStatus = async (req, res, next) => {
  try {
    const swap = await Swap.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(swap);
  } catch (err) {
    next(err);
  }
};