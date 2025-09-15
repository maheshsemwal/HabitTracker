import { Router } from "express";
import feedController from "../controllers/feedController";
import { Authenticate } from "../middleware/authMiddleware";


const router = Router();

router.get("/", Authenticate, feedController.getMyFeed);
router.get("/:id", Authenticate, feedController.getUserFeed);

export default router;
