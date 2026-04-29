/*******************************************************************************
 * File:        multer.js
 * Description: Configures and exports a Multer middleware instance for handling
 *              multipart/form-data file uploads with in-memory disk storage.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import multer from 'multer';

const storage = multer.diskStorage({});

export const upload = multer({storage})