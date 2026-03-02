import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, BookOpen, ClipboardCheck, Users, BarChart3, Library, HeartHandshake, MessageSquare, UserCheck, Calculator } from 'lucide-react';
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
        { icon: <BookOpen className="w-5 h-5" />, label: "My Subjects", to: "/staff/my-subjects" },
        { icon: <Library className="w-5 h-5" />, label: "Assignments", to: "/staff/assignments" },
        { icon: <ClipboardCheck className="w-5 h-5" />, label: "Evaluation", to: "/staff/evaluation" },
        { icon: <BarChart3 className="w-5 h-5" />, label: "Attendance", to: "/staff/attendance" },
        {
            icon: <HeartHandshake className="w-5 h-5" />, label: "Mentorship", to: "/staff/mentorship-governance", items: [
                { label: "Governance Hub", to: "/staff/mentorship-governance" },
                { label: "My Mentees", to: "/staff/mentorship/my-mentees" },
            ]
        },
        { icon: <Calculator className="w-5 h-5" />, label: "Internal Assessment", to: "/staff/my-subjects" },
    ];

    if (isAdvisor) {
        menuItems.push({
            icon: <Users className="w-5 h-5" />,
            label: "My Class",
            to: "/staff/advisor-dashboard",
            items: [
                { label: "Governance Hub", to: "/staff/class-governance" },
                { label: "Attendance Alerts", to: "/staff/attendance-alerts" },
                { label: "Legacy Dashboard", to: "/staff/advisor-dashboard" },
                { label: "Student List", to: "/staff/advisor/students" },
                { label: "Attendance Overview", to: "/staff/advisor/attendance" },
                { label: "Academic Performance", to: "/staff/advisor/performance" },
                { label: "Mentorship Notes", to: "/staff/advisor/notes" },
                { label: "Reports", to: "/staff/advisor/reports" },
            ]
        });

        menuItems.push({
            icon: <UserCheck className="w-5 h-5" />,
            label: "Assign Mentor",
            to: "/staff/mentor-assignment"
        });



        menuItems.push({
            icon: <MessageSquare className="w-5 h-5" />,
            label: "CCM Records",
            to: "/staff/ccm"
        });
    }

    return (
        <DashboardLayout menuItems={menuItems} role="Faculty">
            <Outlet />
        </DashboardLayout>
    );
};

export default StaffLayout;
