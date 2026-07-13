import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout, { type HeaderOptions } from './DashboardLayout';
import { LayoutDashboard, Users, BookOpen, Settings, FileText } from 'lucide-react';

const HODLayout = () => {
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: '',
    });
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/hod/dashboard" },
        {
            icon: <Users className="w-5 h-5" />,
            label: "Academic Ops",
            to: "/hod/subjects",
            items: [
                { label: "Subject Management", to: "/hod/subjects" },
                { label: "Internal Marks", to: "/hod/internal-marks" }
            ]
        },
        {
            icon: <BookOpen className="w-5 h-5" />,
            label: "Faculty & Students",
            to: "/hod/staff",
            items: [
                { label: "Faculty Directory", to: "/hod/staff" },
                { label: "Student Directory", to: "/hod/students" }
            ]
        },
        {
            icon: <FileText className="w-5 h-5" />,
            label: "Insights",
            to: "/hod/analytics",
            items: [
                { label: "Academic Analytics", to: "/hod/analytics" }
            ]
        },
        { icon: <Settings className="w-5 h-5" />, label: "Settings", to: "/settings" },
    ];

    return (
        <DashboardLayout 
            menuItems={menuItems} 
            role="Head of Department"
            headerTitle={headerOptions.title}
            headerSubtitle={headerOptions.subtitle}
            headerActions={headerOptions.actions}
        >
            <Outlet context={{ setHeaderOptions }} />
        </DashboardLayout>
    );
};

export default HODLayout;
