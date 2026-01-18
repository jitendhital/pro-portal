import express from 'express';
import { test, updateUser, deleteUser, getUser } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.get('/:id', getUser);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);

export default router;