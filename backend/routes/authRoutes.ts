import { Router } from "express";
import { authController } from "../controllers/authController";
import { Authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', Authenticate, authController.getCurrentUser);

export default router;