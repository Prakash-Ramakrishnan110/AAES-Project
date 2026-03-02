import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    LayoutDashboard, Building, Users, GraduationCap,
    BookOpen, Upload, BarChart, ArrowRightCircle
} from 'lucide-react';

const AdminLayout = () => {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/admin/dashboard" },
        { icon: <Building className="w-5 h-5" />, label: "Departments", to: "/admin/departments" },
        { icon: <Users className="w-5 h-5" />, label: "Staff", to: "/admin/staff" },
        { icon: <GraduationCap className="w-5 h-5" />, label: "Students", to: "/admin/students" },
        { icon: <BookOpen className="w-5 h-5" />, label: "Subjects", to: "/admin/subjects" },
        { icon: <Upload className="w-5 h-5" />, label: "Bulk Upload", to: "/admin/bulk-upload" },
        { icon: <BarChart className="w-5 h-5" />, label: "Analytics", to: "/admin/analytics" },
        { icon: <ArrowRightCircle className="w-5 h-5" />, label: "Sem Transition", to: "/admin/semester-transition" },
    ];

    return (
        <DashboardLayout menuItems={menuItems} role="Administrator">
            <Outlet />
        </DashboardLayout>
    );
};

export default AdminLayout;
