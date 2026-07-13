import { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout, { type HeaderOptions } from './DashboardLayout';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const StaffLayout = () => {
    useContext(AuthContext)!;
    const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
        title: '',
    });

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
                { label: "Student Directory", to: "/staff/students" },
                { label: "Assignments", to: "/staff/assignments" },
                { label: "Knowledge Base", to: "/staff/knowledge-base" },
                { label: "Evaluation Hub", to: "/staff/evaluation" },
            ]
        },
    ];



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
