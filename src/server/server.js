/*******************************************************************************
 * File:        server.js
 * Description: Express server entry point. Initializes middleware, connects to
 *              the database, and mounts all API route handlers.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';
import { clerkMiddleware } from '@clerk/express';
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messagesRoutes.js';
import groupRouter from './routes/groupRoutes.js';
import groupMessageRouter from './routes/groupMessageRoutes.js';
import forumRouter from './routes/forumRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import sessionRouter from './routes/sessionRoutes.js'
import dashboardRouter from './routes/dashboardRoutes.js'

const app = express();

await connectDB();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is running'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/story', storyRouter);
app.use('/api/message', messageRouter);
app.use('/api/group', groupRouter);
app.use('/api/group-message', groupMessageRouter);
app.use('/api/forum', forumRouter);
app.use('/api/event', eventRouter);
app.use('/api/session', sessionRouter);
app.use('/api/dashboard', dashboardRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));