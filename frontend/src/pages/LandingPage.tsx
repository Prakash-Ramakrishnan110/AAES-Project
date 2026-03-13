import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    BarChart3,
    BookOpen,
    Menu,
    X,
    ArrowRight,
    LayoutDashboard,
    CheckCircle,
    Globe,
    Users
} from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Overview', href: '#' },
        { label: 'Academic Solutions', href: '#' },
        { label: 'Institutional Hub', href: '#' },
        { label: 'Faculty Support', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-[#F4F7FE] font-sans text-[#1B2559] overflow-x-hidden selection:bg-primary/20">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white shadow-sm border-b border-slate-200 py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 xl:px-12 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
                             <LayoutDashboard className="text-white w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-2xl font-bold tracking-tight leading-none ${scrolled ? 'text-slate-900' : 'text-white'}`}>AAES</span>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider mt-1 ${scrolled ? 'text-slate-500' : 'text-slate-300'}`}>Academic Evaluation System</span>
                        </div>
                    </Link>
 
                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-10">
                        {navLinks.map((item) => (
                            <a key={item.label} href={item.href} className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-primary' : 'text-slate-100 hover:text-white'}`}>
                                {item.label}
                            </a>
                        ))}
                        <div className={`h-6 w-px ${scrolled ? 'bg-slate-200' : 'bg-white/20'}`}></div>
                        <Link to="/login" className={`text-sm font-semibold ${scrolled ? 'text-slate-600' : 'text-slate-100'}`}>
                            Portal Login
                        </Link>
                        <Link to="/login" className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">
                            Get Performance Access
                        </Link>
                    </div>
 
                    {/* Mobile Toggle */}
                    <button className="lg:hidden p-2 rounded-lg bg-white/10" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className={scrolled ? 'text-slate-900' : 'text-white'} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 bg-slate-900 overflow-hidden">
                {/* Subtle Geometric Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
                </div>
                
                <div className="container mx-auto px-6 xl:px-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-8">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Institutional Management Framework</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
                            Empowering Institutions with <br />
                            <span className="text-primary">Data-Driven Excellence.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            A comprehensive evaluation system designed for academic progress tracking, 
                            administrative efficiency, and standardized institutional governance.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/login" className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-lg font-bold text-base transition-all hover:bg-primary/90 shadow-lg flex items-center justify-center gap-3">
                                Sign In to Portal
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/20 px-10 py-4 rounded-lg font-bold text-base transition-all">
                                Administrative Overview
                            </button>
                        </div>
                    </motion.div>
 
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-20 max-w-5xl mx-auto relative group"
                    >
                        {/* Professional Dashboard Mockup */}
                        <div className="bg-white p-2 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
                            <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                                {/* Mockup Topbar */}
                                <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                                        <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                                        <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                                    </div>
                                    <div className="h-8 w-1/3 bg-slate-100 rounded-md"></div>
                                    <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="p-8 grid grid-cols-4 gap-6 text-left">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="w-8 h-8 bg-slate-100 rounded-md mb-3"></div>
                                            <div className="h-2 w-3/4 bg-slate-100 rounded-full mb-2"></div>
                                            <div className="h-4 w-1/2 bg-slate-200 rounded-full"></div>
                                        </div>
                                    ))}
                                    <div className="col-span-3 h-48 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                                        <div className="h-4 w-1/4 bg-slate-100 rounded-full mb-6"></div>
                                        <div className="h-24 bg-slate-50 rounded flex items-end justify-between p-4 gap-2">
                                            {[40, 60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                                                <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-1 h-48 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                                        <div className="h-4 w-1/2 bg-slate-100 rounded-full mb-6"></div>
                                        <div className="space-y-4">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                                                    <div className="h-2 flex-1 bg-slate-100 rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Floating Stats Block */}
                         <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -left-10 hidden xl:flex bg-white p-6 rounded-xl shadow-xl border border-slate-100 items-center gap-4 text-left"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="text-primary w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                                    <p className="text-2xl font-bold text-slate-800 tabular-nums">99.8%</p>
                                </div>
                            </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Simple Stats Summary */}
            <section className="py-16 bg-blue-50/30 border-y border-slate-100">
                <div className="container mx-auto px-6 xl:px-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: 'Verified Students', value: '45,800+', icon: <Users className="w-5 h-5" /> },
                            { label: 'Active Institutions', value: '124', icon: <Globe className="w-5 h-5" /> },
                            { label: 'System Recovery', value: '99.99%', icon: <Shield className="w-5 h-5" /> },
                            { label: 'Evaluation Precision', value: '100%', icon: <CheckCircle className="w-5 h-5" /> },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center group border-r last:border-0 border-slate-100 flex flex-col items-center">
                                <div className="text-primary mb-3">{stat.icon}</div>
                                <p className="text-4xl font-bold text-slate-800 tabular-nums">{stat.value}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
 
            {/* Core Features Overview */}
            <section className="py-32 bg-white relative">
                  <div className="container mx-auto px-6 xl:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <h2 className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Platform Capabilities</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                            Structured for Institutional Success
                        </h3>
                    </div>
 
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-primary" />}
                            title="Secure Records"
                            description="Maintaining data integrity with industry-standard encryption, comprehensive audit trails, and strict access controls."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-8 h-8 text-primary" />}
                            title="Performance Analytics"
                            description="Empower decision-makers with real-time performance tracking and historical data comparisons for all academic levels."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-primary" />}
                            title="Flexible Curriculum"
                            description="Streamline evaluation criteria and academic scheduling within a unified management interface."
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>
 
            {/* CTA Final Section */}
            <section className="py-24 bg-primary relative">
                <div className="container mx-auto px-6 xl:px-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tight">
                            Standardize Your Evaluation Process.
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Link to="/login" className="bg-white text-primary px-12 py-4 rounded-lg font-bold text-base transition-all hover:bg-slate-50 shadow-lg flex items-center justify-center gap-3">
                                Get Started Today
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="bg-primary hover:bg-white/10 text-white border border-white/30 px-12 py-4 rounded-lg font-bold text-base transition-all">
                                Contact Administration
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
 
            {/* Traditional Footer */}
            <footer className="bg-slate-50 text-slate-600 py-24 border-t border-slate-200">
                <div className="container mx-auto px-6 xl:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
                        <div className="col-span-2">
                            <Link to="/" className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                                     <LayoutDashboard className="text-white w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 tracking-tight border-b-2 border-primary/20 pb-0.5">AAES</span>
                            </Link>
                            <p className="text-sm font-medium leading-relaxed max-w-sm mb-8 text-slate-500">
                                Providing enterprise-grade management infrastructure for academic progress and institutional reporting.
                            </p>
                        </div>
                        {[
                            { title: 'System', links: ['Evaluation Node', 'Security Center', 'Governance'] },
                            { title: 'Modules', links: ['Student Portal', 'Faculty Hub', 'Principal View'] },
                            { title: 'Company', links: ['About AAES', 'Documentation', 'Support'] }
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8">{col.title}</h4>
                                <ul className="space-y-4 text-sm font-medium">
                                    {col.links.map((link) => (
                                        <li key={link}><a href="#" className="hover:text-primary transition-colors">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-12 border-t border-slate-200 text-xs font-bold text-slate-400 flex flex-col md:flex-row justify-between items-center gap-6">
                        <span className="uppercase tracking-wider">© {new Date().getFullYear()} AAES. Administered by Prakash Ramakrishnan.</span>
                        <div className="flex space-x-12">
                            <a href="#" className="hover:text-primary transition-all uppercase tracking-wider">Privacy Policy</a>
                            <a href="#" className="hover:text-primary transition-all uppercase tracking-wider">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 bg-slate-900 z-[100] p-10 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-20">
                            <span className="text-2xl font-bold text-white tracking-tight">AAES</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-lg"><X className="text-white" /></button>
                        </div>
                        <div className="flex flex-col space-y-8">
                            {navLinks.map((item) => (
                                <a key={item.label} href={item.href} className="text-3xl font-bold text-white tracking-tight">{item.label}</a>
                            ))}
                            <div className="pt-12 border-t border-white/10 flex flex-col gap-4">
                                <Link to="/login" className="bg-primary text-white py-4 rounded-lg text-center font-bold text-lg">Sign In</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="bg-white p-10 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
    >
        <div className="w-16 h-16 bg-slate-50 text-primary rounded-lg flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-300 border border-slate-100">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm font-medium">
            {description}
        </p>
    </motion.div>
);

export default LandingPage;
