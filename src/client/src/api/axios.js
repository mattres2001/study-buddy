/*******************************************************************************
 * File:        axios.js
 * Description: Configures and exports an Axios instance with the API base URL
 *              set from the VITE_BASEURL environment variable.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL
});

export default api