import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, BookOpen, Users, HeartHandshake } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const StaffLayout = () => {
    const { user } = useContext(AuthContext)!;
    const isAdvisor = user?.isAdvisor === true;

    interface MenuItem {
        icon: React.ReactNode;
        label: string;
        to: string;
        items?: { label: string; to: string }[];
    }

    const menuItems: MenuItem[] = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/staff/dashboard" },
        {
            icon: <BookOpen className="w-5 h-5" />,
            label: "Teaching",
            to: "/staff/my-subjects",
            items: [
                { label: "My Subjects", to: "/staff/my-subjects" },
                { label: "Assignments", to: "/staff/assignments" },
                { label: "Evaluation Hub", to: "/staff/evaluation" },
                { label: "Attendance Tracker", to: "/staff/attendance" },
            ]
        },
        {
            icon: <HeartHandshake className="w-5 h-5" />,
            label: "Mentorship",
            to: "/staff/mentorship-governance",
            items: [
                { label: "Governance Hub", to: "/staff/mentorship-governance" },
                { label: "Mentee List", to: "/staff/mentorship/my-mentees" },
                { label: "Student Mapping", to: "/staff/mentor-assignment" },
            ]
        },
    ];

    if (isAdvisor) {
        menuItems.push({
            icon: <Users className="w-5 h-5" />,
            label: "Class Advisor",
            to: "/staff/class-governance",
            items: [
                { label: "Governance Hub", to: "/staff/class-governance" },
                { label: "Attendance Alerts", to: "/staff/attendance-alerts" },
                { label: "CCM Records", to: "/staff/ccm" },
                { label: "Performance Overview", to: "/staff/advisor/performance" },
                { label: "Reports & Analytics", to: "/staff/advisor/reports" },
            ]
        });
    }

    return (
        <DashboardLayout menuItems={menuItems} role="Faculty">
            <Outlet />
        </DashboardLayout>
    );
};

export default StaffLayout;
