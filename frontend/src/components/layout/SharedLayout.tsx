import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutProvider } from '../../layout/LayoutProvider';
import { 
    adminNavigation, 
    hodNavigation, 
    staffNavigation, 
    studentNavigation 
} from '../../layout/nav';

const SharedLayout = () => {
    const { user } = useContext(AuthContext)!;
    const [headerOptions, setHeaderOptions] = useState({
        title: 'Account Management',
        subtitle: 'Global Preferences Node'
    });

    const getLayoutConfig = () => {
        switch (user?.role) {
            case 'admin':
                return { role: 'Administrator', nav: adminNavigation };
            case 'hod':
                return { role: 'Head of Department', nav: hodNavigation };
            case 'staff':
                return { role: 'Faculty Member', nav: staffNavigation };
            case 'student':
                return { role: 'Student', nav: studentNavigation };
            default:
                return { role: 'User', nav: [] };
        }
    };

    const config = getLayoutConfig();

    return (
        <LayoutProvider 
            role={config.role} 
            navigation={config.nav}
            headerOptions={headerOptions}
        >
            <Outlet context={{ setHeaderOptions }} />
        </LayoutProvider>
    );
};

export default SharedLayout;
