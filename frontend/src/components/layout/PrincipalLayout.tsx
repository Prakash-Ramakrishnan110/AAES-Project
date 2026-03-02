import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    LayoutDashboard, Users, ShieldAlert,
    Building2, Globe, FileText, Settings, ClipboardList
} from 'lucide-react';

const PrincipalLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Executive Dashboard", to: "/principal/dashboard" },
        { icon: <Building2 className="w-5 h-5" />, label: "Infrastructure", to: "/principal/departments" },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Institutional Risk", to: "/principal/risk" },
        { icon: <Globe className="w-5 h-5" />, label: "Global Insights", to: "/principal/analytics" },
        { icon: <Users className="w-5 h-5" />, label: "Administrative Staff", to: "/principal/staff" },
        { icon: <FileText className="w-5 h-5" />, label: "Audit Logs", to: "/principal/audit" },
        { icon: <Settings className="w-5 h-5" />, label: "System Settings", to: "/principal/settings" },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Principal">
            <Outlet />
        </DashboardLayout>
    );
};

export default PrincipalLayout;
