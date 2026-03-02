import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    LayoutDashboard, Users, GraduationCap,
    BookOpen, BarChart3, FolderOpen, UserCog, TrendingUp, ShieldAlert, ClipboardList
} from 'lucide-react';

const HODLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/hod/dashboard" },
        { icon: <Users className="w-5 h-5" />, label: "Staff", to: "/hod/staff" },
        { icon: <GraduationCap className="w-5 h-5" />, label: "Students", to: "/hod/students" },
        { icon: <BookOpen className="w-5 h-5" />, label: "Subjects", to: "/hod/subjects" },
        { icon: <BarChart3 className="w-5 h-5" />, label: "Attendance", to: "/hod/attendance" },
        { icon: <FolderOpen className="w-5 h-5" />, label: "Directory", to: "/hod/directory" },
        { icon: <UserCog className="w-5 h-5" />, label: "Class Advisors", to: "/hod/class-advisors" },
        { icon: <TrendingUp className="w-5 h-5" />, label: "Analytics", to: "/hod/analytics" },
        { icon: <ClipboardList className="w-5 h-5" />, label: "Internal Marks", to: "/hod/internal-marks" },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Governance Hub", to: "/hod/governance" },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Head of Department">
            <Outlet />
        </DashboardLayout>
    );
};

export default HODLayout;
