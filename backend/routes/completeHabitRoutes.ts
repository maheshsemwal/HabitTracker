import { Router } from "express";
import {completeHabitController} from "../controllers/completeHabitController";
import { Authenticate } from "../middleware/authMiddleware";
const router = Router();

router.post('/:id', Authenticate, completeHabitController.markAsCompleted);
router.get('/:id', Authenticate, completeHabitController.getHistory);

export default router;
