/*******************************************************************************
 * File:        db.js
 * Description: Establishes a connection to the MongoDB database using Mongoose.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

/*******************************************************************************
 * Function:    connectDB
 * Description: Connects to MongoDB using the MONGODB_URL environment variable
 *              and logs the connection status.
 * Input:       None
 * Output:      Establishes a live Mongoose connection
 * Return:      void
 ******************************************************************************/
const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database connected'));
        await mongoose.connect(`${process.env.MONGODB_URL}/study-buddy`);
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB