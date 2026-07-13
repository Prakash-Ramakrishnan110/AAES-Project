import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout, { type HeaderOptions } from './DashboardLayout';
import { LayoutDashboard, Library } from 'lucide-react';

const StudentLayout = () => {
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: '',
    });

    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/student/dashboard" },
        {
            icon: <Library className="w-5 h-5" />,
            label: "Coursework",
            to: "/student/assignments",
            items: [
                { label: "My Assignments", to: "/student/assignments" },
                { label: "Notes Assistant", to: "/student/notes-ai" }
            ]
        }
    ];

    return (
        <DashboardLayout 
            menuItems={menuItems} 
            role="Student"
            headerTitle={headerOptions.title}
            headerSubtitle={headerOptions.subtitle}
            headerActions={headerOptions.actions}
        >
            <Outlet context={{ setHeaderOptions }} />
        </DashboardLayout>
    );
};

export default StudentLayout;
