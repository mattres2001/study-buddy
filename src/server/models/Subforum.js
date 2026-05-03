/*******************************************************************************
 * File:        Subforum.js
 * Description: Mongoose schema and model for a Subforum document, representing
 *              a class-specific discussion board within the forum.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

const subforumSchema = new mongoose.Schema({
    name:        { type: String, required: true, unique: true },
    class_name:  { type: String, required: true },
    school:      { type: String, default: '' },
    description: { type: String, default: '' },
    created_by:  { type: String, ref: 'User', required: true }
}, { timestamps: true });

const Subforum = mongoose.model('Subforum', subforumSchema);

export default Subforum;
