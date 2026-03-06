import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    LayoutDashboard, Building2, Globe
} from 'lucide-react';

const PrincipalLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Executive Dashboard", to: "/principal/dashboard" },
        {
            icon: <Globe className="w-5 h-5" />,
            label: "Institutional Insights",
            to: "/principal/analytics",
            items: [
                { label: "Global Analytics", to: "/principal/analytics" },
                { label: "Institutional Risk", to: "/principal/risk" },
                { label: "Audit Logs", to: "/principal/audit" },
            ]
        },
        {
            icon: <Building2 className="w-5 h-5" />,
            label: "Administration",
            to: "/principal/departments",
            items: [
                { label: "Infrastructure", to: "/principal/departments" },
                { label: "Administrative Staff", to: "/principal/staff" },
                { label: "System Settings", to: "/principal/settings" },
            ]
        },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Principal">
            <Outlet />
        </DashboardLayout>
    );
};

export default PrincipalLayout;
