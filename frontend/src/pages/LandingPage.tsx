import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { BookOpen, ShieldCheck, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
    const [lottieData, setLottieData] = useState<object | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetching a confirmed working, simple document/education Lottie animation
        fetch('https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json')
            .then(res => res.json())
            .then(data => {
                setLottieData(data);
                setIsLoading(false);
            })
            .catch(() => {
                // Guaranteed fallback
                fetch('https://assets9.lottiefiles.com/packages/lf20_DbCYKfCXBZ.json')
                    .then(r => r.json())
                    .then(d => {
                        setLottieData(d);
                        setIsLoading(false);
                    })
                    .catch(() => {
                        setIsLoading(false);
                    });
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-3 group">
                        {/* Logo Idea: An open book that transforms into an analytics chart, representing AAES */}
                        <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-300">
                            <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white z-10">
                                <path d="M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H9.5C10.3284 4 11 4.67157 11 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 19.5V4.5C20 4.22386 19.7761 4 19.5 4H14.5C13.6716 4 13 4.67157 13 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11 19.5C11 18.6716 11.6716 18 12.5 18C13.3284 18 14 18.6716 14 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Analytics Line inside the book */}
                                <path d="M7 10L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 10L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 14L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 14L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                                AAES<span className="text-indigo-600">.</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Evaluation System</span>
                        </div>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Benefits</a>
                        <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Contact</a>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/login">
                            <button className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 lg:py-32 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 tracking-wide mb-6 border border-indigo-100">
                                <span className="text-xs font-semibold text-indigo-600 uppercase">Version 2.0 Live</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                                Academic Evaluation, <br className="hidden md:block" />
                                <span className="text-indigo-600">Simplified.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Streamline your institution's grading process with secure, AI-powered evaluations, advanced plagiarism detection, and comprehensive academic analytics.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Link to="/login" className="w-full sm:w-auto">
                                    <button className="w-full px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                                        Access Platform
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </Link>
                                <a href="#features" className="w-full flex items-center justify-center sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors border border-slate-200 text-center shadow-sm">
                                    Learn More
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-lg lg:max-w-xl">
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative min-h-[400px] flex items-center justify-center">
                                {/* Decorative elements */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -z-10"></div>
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-50 rounded-full blur-2xl -z-10"></div>

                                {isLoading ? (
                                    <div className="w-full aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                                        <div className="text-slate-400 animate-pulse font-medium">Loading Illustration...</div>
                                    </div>
                                ) : lottieData ? (
                                    <Lottie animationData={lottieData} loop={true} className="w-full h-auto drop-shadow-xl" />
                                ) : (
                                    <div className="w-full aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                                        <div className="text-slate-400 font-medium">Illustration Unavailable</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Core Capabilities
                        </h2>
                        <p className="text-lg text-slate-600">
                            A formal, structured approach to modern academic management. Everything you need to maintain academic integrity and efficiency.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
                            title="Automated Grading"
                            description="Keyword-based deterministic evaluation ensuring fair and consistent grading across all student submissions."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
                            title="Plagiarism Detection"
                            description="Advanced TF-IDF algorithms cross-reference submissions instantly to protect academic integrity."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                            title="Analytics & Reports"
                            description="Generate comprehensive, accreditation-ready PDF reports with detailed performance metrics."
                        />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                Why Choose AAES?
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Our platform is designed specifically for academic institutions requiring robust, secure, and easily manageable systems for student evaluation.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {[
                                    'Completely secure and on-premise data handling',
                                    'Intuitive interface for HODs, Advisors, and Students',
                                    'Seamless support for multiple assignment formats',
                                    'Time-saving automation for educators'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-slate-100">
                            <div className="space-y-6">
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                    <h4 className="font-bold text-indigo-900 mb-2">Institution-Level Control</h4>
                                    <p className="text-sm text-indigo-700">HODs can monitor performance across departments with real-time dashboards.</p>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <h4 className="font-bold text-blue-900 mb-2">Faculty Efficiency</h4>
                                    <p className="text-sm text-blue-700">Advisors spend less time grading and more time mentoring students.</p>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <h4 className="font-bold text-emerald-900 mb-2">Student Clarity</h4>
                                    <p className="text-sm text-emerald-700">Transparent rubrics and instant feedback mechanisms build trust.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        <span className="font-bold text-white tracking-widest text-sm">AAES Platform</span>
                    </div>
                    <p className="text-sm">© {new Date().getFullYear()} AAES. All rights reserved.</p>
                    <div className="flex space-x-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Feature Card Sub-component
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed font-medium">{description}</p>
    </div>
);

export default LandingPage;
