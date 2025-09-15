import { Router } from "express";
import userController from "../controllers/userController";
import { Authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post('/:id', Authenticate, userController.sendRequest);
router.put('/:id', Authenticate, userController.respondRequest);
router.get('/', Authenticate, userController.getRequests);
router.get('/followers/:id', Authenticate, userController.getFollowers);
router.get('/following/:id', Authenticate, userController.getFollowing);

export default router;