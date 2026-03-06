import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Search,
    Shield,
    BarChart3,
    GraduationCap,
    Brain,
    Layers,
    ArrowRight,
    PlayCircle,
    CheckCircle2,
    Menu,
    X
} from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: { transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
                }`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="flex flex-col">
                            <span className={`text-2xl font-serif font-black tracking-tight leading-none ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                                𝐀𝐀𝐄𝐒
                            </span>
                            <span className={`text-[8px] uppercase font-bold tracking-widest leading-none mt-1 ${scrolled ? 'text-indigo-600' : 'text-mongodb-spring-green'}`}>
                                Academic Intelligence
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Platform', 'Solutions', 'Resources', 'Pricing'].map((item) => (
                            <a key={item} href="#" className={`text-sm font-medium hover:text-mongodb-spring-green transition-colors ${scrolled ? 'text-slate-600' : 'text-slate-300'
                                }`}>
                                {item}
                            </a>
                        ))}
                        <Link to="/login" className={`px-5 py-2 rounded-lg text-sm font-bold transition-all border ${scrolled
                                ? 'border-slate-200 text-slate-900 hover:bg-slate-50'
                                : 'border-slate-700 text-white hover:border-slate-500'
                            }`}>
                            Sign In
                        </Link>
                        <Link to="/login" className="bg-mongodb-spring-green hover:bg-emerald-400 text-mongodb-navy px-5 py-2 rounded-lg text-sm font-black transition-all shadow-lg shadow-emerald-500/20">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className={scrolled ? 'text-slate-900' : 'text-white'} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-mongodb-navy overflow-hidden">
                <div className="absolute inset-0 mongodb-grid opacity-30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] mongodb-glow pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div {...fadeInUp} className="mb-6 inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                            <span className="flex h-2 w-2 rounded-full bg-mongodb-spring-green animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">AAES Intelligence v2.0 Now Live</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white mb-8 tracking-tight leading-[1.1]"
                        >
                            Unified Academic <br />
                            <span className="text-mongodb-spring-green">Intelligence System.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                        >
                            Streamline evaluation, automate grading, and unlock actionable academic insights
                            with the industry's most trusted AI-powered platform for institutions.
                        </motion.p>

                        {/* Search Bar Teaser */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="max-w-2xl mx-auto mb-12 relative group"
                        >
                            <div className="absolute inset-0 bg-mongodb-spring-green/20 blur-xl group-hover:bg-mongodb-spring-green/30 transition-all rounded-2xl"></div>
                            <div className="relative bg-mongodb-navy-dark border border-white/10 p-2 rounded-2xl flex items-center shadow-2xl">
                                <Search className="ml-4 text-slate-500 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Ask AAES: How to improve student retention?"
                                    className="bg-transparent border-none focus:ring-0 text-white flex-1 px-4 py-3 placeholder:text-slate-600"
                                    disabled
                                />
                                <button className="bg-mongodb-spring-green text-mongodb-navy px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-emerald-400">
                                    Ask AI
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/login" className="w-full sm:w-auto bg-mongodb-spring-green hover:bg-emerald-400 text-mongodb-navy px-8 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 group">
                                Start Your Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                <PlayCircle className="w-5 h-5" />
                                Watch Demo
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats / Partners */}
            <section className="py-12 bg-white border-b border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 grayscale opacity-50 contrast-125">
                        {['University of Oxford', 'Harvard Institute', 'MIT Labs', 'Stanford Edu'].map((univ) => (
                            <div key={univ} className="flex justify-center items-center">
                                <span className="font-serif font-black text-xl italic text-slate-400 tracking-tighter">{univ}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-sm font-bold text-mongodb-digital-blue uppercase tracking-[0.2em] mb-4">The Platform</h2>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 tracking-tight">
                            Built for the next generation of <span className="text-mongodb-forest-green">Academic Excellence.</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Everything you need to run high-stakes examinations, manage complex logistics,
                            and evaluate performance at scale.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-6 h-6" />}
                            title="Uncompromising Security"
                            description="AI-driven proctoring and encrypted data storage ensuring the highest integrity for academic records."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-6 h-6" />}
                            title="Predictive Analytics"
                            description="Identify trends and student risks before they happen with our advanced risk-pattern recognition."
                        />
                        <FeatureCard
                            icon={<Brain className="w-6 h-6" />}
                            title="AI Grading Engine"
                            description="Automated subjective and objective grading that reduces workload by 80% while increasing precision."
                        />
                    </div>
                </div>
            </section>

            {/* Split Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 mb-6 leading-tight">
                                Transform raw data into <br />
                                <span className="text-mongodb-digital-blue underline decoration-4 underline-offset-8">Institutional Wisdom.</span>
                            </h2>
                            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                                Our platform doesn't just store grades. It connects the dots across departments,
                                semester cycles, and individual student progress to give you a 360° view.
                            </p>

                            <ul className="space-y-4 mb-10 text-slate-700 font-medium">
                                {[
                                    'Real-time departmental performance audits',
                                    'Automated compliance and risk reporting',
                                    'Personalized student intervention triggers',
                                    'Seamless LMS and SIS integration'
                                ].map((item) => (
                                    <li key={item} className="flex items-center space-x-3 text-sm">
                                        <CheckCircle2 className="text-mongodb-spring-green w-5 h-5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="text-mongodb-forest-green font-black flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                                Explore Analytics Engine <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute -inset-4 bg-mongodb-spring-green/5 blur-2xl rounded-3xl-plus"></div>
                            <div className="relative bg-white p-8 rounded-3xl-plus shadow-2xl border border-slate-100">
                                <div className="space-y-6">
                                    <div className="h-6 w-1/3 bg-slate-100 rounded"></div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-32 bg-slate-50 rounded-xl border border-slate-100"></div>
                                        <div className="h-32 bg-mongodb-navy rounded-xl flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full border-4 border-mongodb-spring-green border-t-transparent animate-spin"></div>
                                        </div>
                                        <div className="h-32 bg-slate-50 rounded-xl border border-slate-100"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-3 w-full bg-slate-50 rounded"></div>
                                        <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
                                        <div className="h-3 w-4/6 bg-slate-50 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-mongodb-navy relative h-[400px] flex items-center">
                <div className="absolute inset-0 mongodb-grid opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-10">
                        Ready to elevate your institution?
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/login" className="bg-mongodb-spring-green hover:bg-emerald-400 text-mongodb-navy px-10 py-5 rounded-xl font-black transition-all">
                            Get Started Free
                        </Link>
                        <button className="bg-transparent text-white border border-white/20 px-10 py-5 rounded-xl font-bold hover:bg-white/5 transition-all">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-mongodb-navy-dark text-slate-500 py-16 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex flex-col mb-6">
                                <span className="text-3xl font-serif font-black tracking-tight text-white leading-none">
                                    𝐀𝐀𝐄𝐒
                                </span>
                                <span className="text-[9px] uppercase font-bold text-mongodb-spring-green tracking-widest leading-none mt-2">
                                    Academic Analytics System
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed max-w-xs mb-8">
                                The world's most comprehensive academic intelligence system,
                                built for speed, security, and scale.
                            </p>
                        </div>
                        {[
                            { title: 'Platform', links: ['Analytics', 'Security', 'Compliance', 'Integrations'] },
                            { title: 'Resources', links: ['Documentation', 'Guides', 'Support', 'Community'] },
                            { title: 'Company', links: ['About Us', 'Careers', 'Contact', 'Blog'] },
                            { title: 'Legal', links: ['Privacy Policy', 'Terms of Use', 'Security', 'GDPR'] }
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">{col.title}</h4>
                                <ul className="space-y-4 text-sm">
                                    {col.links.map((link) => (
                                        <li key={link}><a href="#" className="hover:text-mongodb-spring-green transition-colors">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 text-xs font-bold uppercase tracking-widest">
                        <span>© {new Date().getFullYear()} AAES. Precision Evaluation Protocol.</span>
                        <div className="flex space-x-8 mt-6 md:mt-0">
                            <a href="#" className="hover:text-white">Twitter</a>
                            <a href="#" className="hover:text-white">LinkedIn</a>
                            <a href="#" className="hover:text-white">GitHub</a>
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
                        className="fixed inset-0 bg-mongodb-navy z-[100] p-6 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-2xl font-serif font-black text-white">𝐀𝐀𝐄𝐒</span>
                            <button onClick={() => setMobileMenuOpen(false)}><X className="text-white" /></button>
                        </div>
                        <div className="flex flex-col space-y-8">
                            {['Platform', 'Solutions', 'Resources', 'Pricing'].map((item) => (
                                <a key={item} href="#" className="text-2xl font-bold text-white hover:text-mongodb-spring-green">{item}</a>
                            ))}
                            <div className="pt-12 flex flex-col gap-4">
                                <Link to="/login" className="bg-mongodb-spring-green text-mongodb-navy py-4 rounded-xl text-center font-black">Get Started</Link>
                                <Link to="/login" className="border border-white/20 text-white py-4 rounded-xl text-center font-bold">Sign In</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-white p-10 rounded-3xl-plus shadow-sm border border-slate-100 hover:shadow-xl hover:border-mongodb-spring-green/30 transition-all group duration-500">
        <div className="w-14 h-14 bg-mongodb-navy rounded-2xl flex items-center justify-center text-mongodb-spring-green mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-emerald-500/10">
            {icon}
        </div>
        <h3 className="text-xl md:text-2xl font-serif font-black text-slate-900 mb-4 tracking-tight leading-none group-hover:text-mongodb-forest-green transition-colors">
            {title}
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">
            {description}
        </p>
    </div>
);

export default LandingPage;
