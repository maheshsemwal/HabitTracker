import { Router } from "express";
import { Authenticate } from "../middleware/authMiddleware";
import analyticsController from "../controllers/analyticsController";

const router = Router();

router.get('/:id', Authenticate, analyticsController.getUserAnalytics);

export default router;