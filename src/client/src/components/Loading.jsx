/*******************************************************************************
 * File:        Loading.jsx
 * Description: Simple full-screen (or configurable height) loading spinner
 *              displayed while data is being fetched.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'

/*******************************************************************************
 * Function:    Loading
 * Description: Renders a centered spinner inside a container of the specified
 *              height.
 * Input:       height (string) - CSS height value, defaults to '100vh'
 * Output:      Rendered loading spinner
 * Return:      JSX.Element
 ******************************************************************************/
const Loading = ({height = '100vh'}) => {
  return (
    <div style={{ height }} className='flex items-center justify-center h-screen'>
      <div className='w-10 h-10 rounded-full border-3 border-primary-500 border-t-transparent animate-spin'>

      </div>
    </div>
  )
}

export default Loading
