import React, { useState, useEffect } from "react";
import "aos/dist/aos.css"; import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';




// this component renders form to be passed to VideoChat.js
const Profile = () => {
    <ProSidebar>
        <Menu iconShape="square">
            <MenuItem >Dashboard</MenuItem>
            <SubMenu title="Components" >
                <MenuItem>Component 1</MenuItem>
                <MenuItem>Component 2</MenuItem>
            </SubMenu>
        </Menu>
    </ProSidebar>;
}
export default Profile;