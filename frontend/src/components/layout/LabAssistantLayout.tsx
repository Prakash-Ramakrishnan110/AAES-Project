import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout, { type HeaderOptions } from './DashboardLayout';
import { LayoutDashboard, ClipboardList, Hammer, Settings, Wrench } from 'lucide-react';

const LabAssistantLayout = () => {
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: '',
    });

    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/labassistant/dashboard" },
        { icon: <ClipboardList className="w-5 h-5" />, label: "Morning Attendance", to: "/labassistant/morning-attendance" },
        { icon: <Hammer className="w-5 h-5" />, label: "Maintenance Issues", to: "/labassistant/maintenance" },
        { icon: <Wrench className="w-5 h-5" />, label: "Equipment Status", to: "/labassistant/equipment" },
        { icon: <Settings className="w-5 h-5" />, label: "Settings", to: "/settings" },
    ];

    return (
        <DashboardLayout 
            menuItems={menuItems} 
            role="Lab Assistant"
            headerTitle={headerOptions.title}
            headerSubtitle={headerOptions.subtitle}
            headerActions={headerOptions.actions}
        >
            <Outlet context={{ setHeaderOptions }} />
        </DashboardLayout>
    );
};

export default LabAssistantLayout;
