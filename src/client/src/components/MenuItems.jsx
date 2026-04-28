/*******************************************************************************
 * File:        MenuItems.jsx
 * Description: Navigation menu component that renders the main sidebar links
 *              from the menuItemsData configuration.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'

/*******************************************************************************
 * Function:    MenuItems
 * Description: Renders a list of NavLink items from menuItemsData with active
 *              state styling and closes the sidebar on mobile when navigating.
 * Input:       setSidebarOpen (function) - collapses the sidebar on link click
 * Output:      Rendered navigation link list
 * Return:      JSX.Element
 ******************************************************************************/
const MenuItems = ({setSidebarOpen}) => {
  return (
    <div className='px-6 text-gray-600 space-y-1 font-medium'>
      {
        menuItemsData.map(({to, label, Icon}) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setSidebarOpen(false)}
                className={({isActive}) => `px-3.5 py-2 flex items-center gap-3 rounded-x1
                ${isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}>
                    <Icon className='w-5 h-5' />
                    {label}
            </NavLink>
        ))
      }
    </div>
  )
}

export default MenuItems
