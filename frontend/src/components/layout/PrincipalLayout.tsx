import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout, { type HeaderOptions } from './DashboardLayout';
import {
    LayoutDashboard, Building2, Globe, Bell
} from 'lucide-react';

const PrincipalLayout = () => {
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: '',
    });
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Executive Dashboard", to: "/principal/dashboard" },
        { icon: <Bell className="w-5 h-5" />, label: "Communications", to: "/principal/communications" },
        {
            icon: <Globe className="w-5 h-5" />,
            label: "Institutional Insights",
            to: "/principal/analytics",
            items: [
                { label: "Global Analytics", to: "/principal/analytics" },
                { label: "Institutional Risk", to: "/principal/risk" },
                { label: "Attendance Oversight", to: "/principal/attendance" },
                { label: "Audit Logs", to: "/principal/audit" },
            ]
        },
        {
            icon: <Building2 className="w-5 h-5" />,
            label: "Administration",
            to: "/principal/departments",
            items: [
                { label: "Administrative Staff", to: "/principal/staff" },
                { label: "Leave Management", to: "/principal/leaves" },
                { label: "System Settings", to: "/principal/settings" },
            ]
        },
    ];

    return (
        <DashboardLayout 
            menuItems={menuItems} 
            role="Principal"
            headerTitle={headerOptions.title}
            headerSubtitle={headerOptions.subtitle}
            headerActions={headerOptions.actions}
        >
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <Outlet context={{ setHeaderOptions }} />
            </Suspense>
        </DashboardLayout>
    );
};

export default PrincipalLayout;
