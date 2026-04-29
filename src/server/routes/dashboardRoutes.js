/*******************************************************************************
 * File:        dashboardRoutes.js
 * Description: Express router defining the /api/dashboard endpoint for
 *              retrieving aggregated dashboard data for the authenticated user.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import express from 'express';
import { 
    getDashboardData
} from '../controllers/dashboardController.js'
import { protect } from '../middleware/auth.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/data', protect, getDashboardData);

export default dashboardRouter