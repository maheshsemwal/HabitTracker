import { Router } from "express";
import userController from "../controllers/userController";
import { Authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/search", userController.searchUsers);
router.get("/profile/:userId", userController.getUserProfile);
router.post('/follow/:id', Authenticate, userController.sendRequest);
router.put('/request/:id', Authenticate, userController.respondRequest);
router.get('/requests', Authenticate, userController.getRequests);
router.get('/followers/:id', Authenticate, userController.getFollowers);
router.get('/following/:id', Authenticate, userController.getFollowing);

export default router;