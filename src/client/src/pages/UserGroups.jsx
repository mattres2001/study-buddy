/*******************************************************************************
 * File:        UserGroups.jsx
 * Description: Page displaying all study groups available to or joined by the
 *              user, rendered as a grid of GroupCard components.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import GroupCard from '../components/GroupCard'
import banner from '../assets/sample_cover.jpg'

const groups = [
  {id:1,
    name: 'Study Buddies',
    cover: banner,
    memberCount:12,
  },
  {
    id: 2,
    name: 'Math Squad',
    cover: banner,
    memberCount: 8,
  },
  {
    id: 3,
    name: 'Physics Crew',
    cover: banner,
    memberCount: 21,
  },
  {id:4,
    name: 'Study Buddies dupe',
    cover: banner,
    memberCount:12,
  },
  {
    id: 5,
    name: 'Math Squad dupe',
    cover: banner,
    memberCount: 8,
  },
  {
    id: 6,
    name: 'Physics Crew dupe',
    cover: banner,
    memberCount: 21,
  },
]


/*******************************************************************************
 * Function:    UserGroups
 * Description: Renders a grid of GroupCard components displaying all study
 *              groups available to or joined by the user.
 * Input:       None (reads group data from the Redux store or API)
 * Output:      Rendered group card grid
 * Return:      JSX.Element
 ******************************************************************************/
const UserGroups = () => {
  return (
    <div className='p-6 ml-8'>
      <h1 className='text-2xl font-bold mb-6'>My Group's</h1>

      <div className='flex flex-wrap gap-6'>
        {groups.map((group) => (
          <GroupCard key={group.id} group={group}/>
        ))}
      </div>
    </div>
   
  )
}