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
    <div className='px-4 space-y-1'>
      {
        menuItemsData.map(({to, label, Icon}) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setSidebarOpen(false)}
                className={({isActive}) => `px-4 py-2.5 flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                    ? 'bg-white text-primary-600 shadow-sm border border-gray-100 font-semibold'
                    : 'text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm'}`}>
                    <Icon className='w-5 h-5 flex-shrink-0' />
                    {label}
            </NavLink>
        ))
      }
    </div>
  )
}

export default MenuItems
