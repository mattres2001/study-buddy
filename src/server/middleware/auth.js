/*******************************************************************************
 * File:        auth.js
 * Description: Authentication middleware that validates Clerk session tokens
 *              and protects routes from unauthenticated access.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/

/*******************************************************************************
 * Function:    protect
 * Description: Express middleware that verifies the authenticated user's Clerk
 *              userId. Rejects the request if no valid session is found.
 * Input:       req (Express Request), res (Express Response), next (NextFunction)
 * Output:      Calls next() on success, or sends a JSON error response
 * Return:      void
 ******************************************************************************/
export const protect = async (req, res, next) => {
    try {
        const {userId} = await req.auth();
        if (!userId) {
            return res.json({
                success: false, 
                message: "not authenticated"
            });
        }
        next();
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}