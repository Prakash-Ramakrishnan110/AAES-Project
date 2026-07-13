import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout, { type HeaderOptions } from './DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Building, 
    Users, 
    Upload, 
    Bell,
    BookOpen,
    Library,
    Settings,
    FileText
} from 'lucide-react';

const ProfileLayout = () => {
    const { user } = useContext(AuthContext)!;
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: 'User Profile',
    });

    const getMenuItems = () => {
        if (!user) return [];

        switch (user.role) {
            case 'admin':
                return [
                    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/admin/dashboard" },
                    { icon: <Bell className="w-5 h-5" />, label: "Communications", to: "/admin/communications" },
                    {
                        icon: <Building className="w-5 h-5" />,
                        label: "Institutional Setup",
                        to: "/admin/departments",
                        items: [
                            { label: "Department Hub", to: "/admin/departments" },
                            { label: "Curriculum/Subjects", to: "/admin/subjects" },
                        ]
                    },
                    {
                        icon: <Users className="w-5 h-5" />,
                        label: "People Management",
                        to: "/admin/staff",
                        items: [
                            { label: "Faculty Directory", to: "/admin/staff" },
                            { label: "Student Registry", to: "/admin/students" },
                        ]
                    },
                    {
                        icon: <Upload className="w-5 h-5" />,
                        label: "System Ops",
                        to: "/admin/bulk-upload",
                        items: [
                            { label: "Data Import", to: "/admin/bulk-upload" },
                            { label: "Performance Analytics", to: "/admin/analytics" },
                            { label: "System Audit Logs", to: "/admin/audit-logs" },
                        ]
                    },
                ];
            case 'hod':
                return [
                    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/hod/dashboard" },
                    {
                        icon: <Users className="w-5 h-5" />,
                        label: "Academic Ops",
                        to: "/hod/subjects",
                        items: [
                            { label: "Subject Management", to: "/hod/subjects" }
                        ]
                    },
                    {
                        icon: <BookOpen className="w-5 h-5" />,
                        label: "Faculty & Students",
                        to: "/hod/staff",
                        items: [
                            { label: "Faculty Directory", to: "/hod/staff" },
                            { label: "Student Directory", to: "/hod/students" }
                        ]
                    },
                    {
                        icon: <FileText className="w-5 h-5" />,
                        label: "Insights",
                        to: "/hod/analytics",
                        items: [
                            { label: "Academic Analytics", to: "/hod/analytics" }
                        ]
                    },
                    { icon: <Settings className="w-5 h-5" />, label: "Settings", to: "/settings" },
                ];
            case 'staff':
                return [
                    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/staff/dashboard" },
                    {
                        icon: <BookOpen className="w-5 h-5" />,
                        label: "Teaching",
                        to: "/staff/my-subjects",
                        items: [
                            { label: "My Subjects", to: "/staff/my-subjects" },
                            { label: "Student Directory", to: "/staff/students" },
                            { label: "Assignments", to: "/staff/assignments" },
                            { label: "Knowledge Base", to: "/staff/knowledge-base" },
                            { label: "Evaluation Hub", to: "/staff/evaluation" },
                        ]
                    },
                    { icon: <Settings className="w-5 h-5" />, label: "Settings", to: "/settings" },
                ];
            case 'student':
                return [
                    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", to: "/student/dashboard" },
                    {
                        icon: <Library className="w-5 h-5" />,
                        label: "Coursework",
                        to: "/student/assignments",
                        items: [
                            { label: "My Assignments", to: "/student/assignments" },
                            { label: "Notes Assistant", to: "/student/notes-ai" }
                        ]
                    }
                ];
            default:
                return [];
        }
    };

    const roleLabels: Record<string, string> = {
        admin: 'Administrator',
        hod: 'Head of Department',
        staff: 'Faculty',
        student: 'Student',
        principal: 'Principal'
    };

    return (
        <DashboardLayout 
            menuItems={getMenuItems()} 
            role={roleLabels[user?.role || ''] || 'User'}
            headerTitle={headerOptions.title}
            headerSubtitle={headerOptions.subtitle}
            headerActions={headerOptions.actions}
        >
            <Outlet context={{ setHeaderOptions }} />
        </DashboardLayout>
    );
};

export default ProfileLayout;
