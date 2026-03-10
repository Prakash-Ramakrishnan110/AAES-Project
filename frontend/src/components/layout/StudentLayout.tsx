import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    LayoutDashboard, Library, Clock, BriefcaseMedical, FileBadge, Bell
} from 'lucide-react';

const StudentLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/student/dashboard" },
        { icon: <Bell className="w-5 h-5" />, label: "Communications", to: "/student/communications" },
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
            icon: <BriefcaseMedical className="w-5 h-5" />,
            label: "Leave Applications",
            to: "/student/leaves"
        },
        {
            icon: <Clock className="w-5 h-5" />,
            label: "Attendance",
            to: "/student/attendance"
        },
        {
            icon: <FileBadge className="w-5 h-5" />,
            label: "My Documents",
            to: "/student/documents"
        },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Student">
            <Outlet />
        </DashboardLayout>
    );
};

export default StudentLayout;
