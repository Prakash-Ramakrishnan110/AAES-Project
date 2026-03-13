import { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout, { type HeaderOptions } from './DashboardLayout';
import { LayoutDashboard, Users, BookOpen, Settings, Bell, CheckSquare, HeartHandshake } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const StaffLayout = () => {
    const { user } = useContext(AuthContext)!;
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: '',
    });
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
            icon: <Bell className="w-5 h-5" />,
            label: "Communications",
            to: "/staff/communications"
        },
        {
            icon: <CheckSquare className="w-5 h-5" />,
            label: "My Assigned Work",
            to: "/staff/my-work"
        },

        {
            icon: <BookOpen className="w-5 h-5" />,
            label: "Teaching",
            to: "/staff/my-subjects",
            items: [
                { label: "My Subjects", to: "/staff/my-subjects" },
                { label: "Student Directory", to: "/staff/students" },
                { label: "My Timetable", to: "/staff/timetable" },
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
                { label: "My Students", to: "/staff/advisor/students" },
                { label: "Mark Class Attendance", to: "/staff/advisor-marking" },
                { label: "Governance Hub", to: "/staff/class-governance" },
                { label: "Master Timetable", to: "/staff/department-timetable" },
                { label: "Attendance Alerts", to: "/staff/attendance-alerts" },
                { label: "CCM Records", to: "/staff/ccm" },
                { label: "My Notes", to: "/staff/advisor/notes" },
                { label: "Reports", to: "/staff/advisor/reports" },
                { label: "Leave Requests", to: "/staff/advisor/leaves" },
                { label: "Student Documents", to: "/staff/advisor/documents" },
            ]
        });
    }

    menuItems.push({ icon: <Settings className="w-5 h-5" />, label: "Settings", to: "/settings" });

    return (
        <DashboardLayout 
            menuItems={menuItems} 
            role="Faculty"
            headerTitle={headerOptions.title}
            headerSubtitle={headerOptions.subtitle}
            headerActions={headerOptions.actions}
        >
            <Outlet context={{ setHeaderOptions }} />
        </DashboardLayout>
    );
};

export default StaffLayout;
