import React from 'react'
import CreateRoomBtnModel from './Dashboard/CreateRoomBtnModel';
import DashboardToggle from './Dashboard/DashboardToggle';

const Sidebar = () => {
  return (
    <div className='h-100 pt-2'>
        <div>
            <DashboardToggle/>
            <CreateRoomBtnModel/>
        </div>

        bottom

    </div>
  );
};

export default Sidebar;