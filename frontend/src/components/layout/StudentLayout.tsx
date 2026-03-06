import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    LayoutDashboard, Library, BarChart3, ClipboardList, BookOpen
} from 'lucide-react';

const StudentLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/student/dashboard" },
        {
            icon: <Library className="w-5 h-5" />,
            label: "Coursework",
            to: "/student/assignments",
            items: [
                { label: "My Assignments", to: "/student/assignments" },
                { label: "Study Resources", to: "/student/resources" },
            ]
        },
        {
            icon: <BarChart3 className="w-5 h-5" />,
            label: "Academic Performance",
            to: "/student/attendance",
            items: [
                { label: "Attendance", to: "/student/attendance" },
                { label: "Internal Marks", to: "/student/internal-marks" },
            ]
        },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Student">
            <Outlet />
        </DashboardLayout>
    );
};

export default StudentLayout;
