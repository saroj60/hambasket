import express from 'express';
import { resolveLocation } from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/resolve', resolveLocation);

export default router;
