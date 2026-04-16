import express from 'express';
import { 
    getDashboardData
} from '../controllers/dashboardController.js'
import { protect } from '../middleware/auth.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/data', protect, getDashboardData);

export default dashboardRouter