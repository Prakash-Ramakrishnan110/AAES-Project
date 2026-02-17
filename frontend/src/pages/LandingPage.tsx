import { Link } from 'react-router-dom';
import { BookOpen, Users, LineChart, Shield, Cpu, Award } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Hero Section */}
            <div className="container mx-auto px-6 py-16">
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center space-x-2">
                        <Award className="w-10 h-10 text-yellow-400" />
                        <h1 className="text-3xl font-bold text-white">AAES</h1>
                    </div>
                    <Link
                        to="/login"
                        className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
                    >
                        Login
                    </Link>
                </nav>

                <div className="text-center text-white mb-20">
                    <h2 className="text-6xl font-bold mb-6 animate-fade-in">
                        AI-Powered Academic Excellence
                    </h2>
                    <p className="text-2xl mb-8 text-gray-200">
                        Automated Assignment Evaluation System
                    </p>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-10">
                        Transform your academic workflow with intelligent auto-grading, OCR-based theory evaluation,
                        and comprehensive analytics powered by cutting-edge AI technology.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-4 rounded-full text-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition transform hover:scale-105 shadow-2xl"
                    >
                        Get Started →
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <FeatureCard
                        icon={<Cpu className="w-12 h-12 text-blue-400" />}
                        title="Python Auto-Grading"
                        description="Instant code evaluation with test case validation and security sandboxing"
                    />
                    <FeatureCard
                        icon={<BookOpen className="w-12 h-12 text-green-400" />}
                        title="Theory AI Evaluation"
                        description="OCR + LLM-powered assessment of handwritten answers with intelligent feedback"
                    />
                    <FeatureCard
                        icon={<LineChart className="w-12 h-12 text-purple-400" />}
                        title="Advanced Analytics"
                        description="Real-time performance tracking across departments, subjects, and semesters"
                    />
                    <FeatureCard
                        icon={<Users className="w-12 h-12 text-pink-400" />}
                        title="Role-Based Access"
                        description="Dedicated dashboards for Admins, HODs, Staff, and Students"
                    />
                    <FeatureCard
                        icon={<Shield className="w-12 h-12 text-yellow-400" />}
                        title="Secure & Reliable"
                        description="JWT authentication, code validation, and enterprise-grade security"
                    />
                    <FeatureCard
                        icon={<Award className="w-12 h-12 text-orange-400" />}
                        title="Semester Management"
                        description="Automated student promotion and academic history preservation"
                    />
                </div>

                {/* Stats Section */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-white">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <StatCard number="4" label="User Roles" />
                        <StatCard number="2" label="Evaluation Engines" />
                        <StatCard number="∞" label="Subjects Supported" />
                        <StatCard number="24/7" label="Availability" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/20 py-8">
                <div className="container mx-auto px-6 text-center text-gray-300">
                    <p className="text-sm">
                        © 2024 AAES - Automated Assignment Evaluation System.
                        Powered by AI, Built for Excellence.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition transform hover:scale-105">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300">{description}</p>
    </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
    <div>
        <div className="text-5xl font-bold text-yellow-400 mb-2">{number}</div>
        <div className="text-gray-300">{label}</div>
    </div>
);

export default LandingPage;
