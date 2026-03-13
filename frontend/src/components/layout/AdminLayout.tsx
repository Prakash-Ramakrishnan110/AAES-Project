import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, Building, Users, Upload, Bell } from 'lucide-react';

export interface HeaderOptions {
    title: string;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
}

const AdminLayout = () => {
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: '',
    });
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/admin/dashboard" },
        { icon: <Bell className="w-5 h-5" />, label: "Communications", to: "/admin/communications" },
        {
            icon: <Building className="w-5 h-5" />,
            label: "Institutional Setup",
            to: "/admin/departments",
            items: [
                { label: "Department Hub", to: "/admin/departments" },
                { label: "Curriculum/Subjects", to: "/admin/subjects" },
            ]
        },
        {
            icon: <Users className="w-5 h-5" />,
            label: "People Management",
            to: "/admin/staff",
            items: [
                { label: "Faculty Directory", to: "/admin/staff" },
                { label: "Student Registry", to: "/admin/students" },
            ]
        },
        {
            icon: <Upload className="w-5 h-5" />,
            label: "System Ops",
            to: "/admin/bulk-upload",
            items: [
                { label: "Data Import", to: "/admin/bulk-upload" },
                { label: "Performance Analytics", to: "/admin/analytics" },
                { label: "System Audit Logs", to: "/admin/audit-logs" },
                { label: "Global Settings & Data", to: "/admin/settings" },
                { label: "Academic Transitions", to: "/admin/semester-transition" },
            ]
        },
    ];

    return (
        <DashboardLayout 
            menuItems={menuItems} 
            role="Administrator"
            headerTitle={headerOptions.title}
            headerSubtitle={headerOptions.subtitle}
            headerActions={headerOptions.actions}
        >
            <Outlet context={{ setHeaderOptions }} />
        </DashboardLayout>
    );
};

export default AdminLayout;
