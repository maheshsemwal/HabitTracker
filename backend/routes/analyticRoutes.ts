import { Router } from "express";
import { Authenticate } from "../middleware/authMiddleware";
import analyticsController from "../controllers/analyticsController";

const router = Router();

router.get('/:id', Authenticate, analyticsController.getUserAnalytics);
router.get('/charts/:userId', Authenticate, analyticsController.getChartData);

export default router;