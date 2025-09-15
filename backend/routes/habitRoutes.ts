import habitController from "../controllers/habitController";
import { Router } from "express";
import { Authenticate } from "../middleware/authMiddleware";
const router = Router();

router.get('/', Authenticate, habitController.getHabits);
router.post('/', Authenticate, habitController.createHabit);
router.put('/:id', Authenticate, habitController.updateHabit);
router.delete('/:id', Authenticate, habitController.deleteHabit);
export default router;
