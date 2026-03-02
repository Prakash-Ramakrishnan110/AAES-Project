import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    LayoutDashboard, Library, BarChart3, ClipboardList
} from 'lucide-react';

const StudentLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/student/dashboard" },
        { icon: <Library className="w-5 h-5" />, label: "Assignments", to: "/student/assignments" },
        { icon: <BarChart3 className="w-5 h-5" />, label: "Attendance", to: "/student/attendance" },
        { icon: <ClipboardList className="w-5 h-5" />, label: "Internal Marks", to: "/student/internal-marks" },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Student">
            <Outlet />
        </DashboardLayout>
    );
};

export default StudentLayout;
