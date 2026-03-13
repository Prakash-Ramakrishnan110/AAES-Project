import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-50 rounded-full">
                        <AlertCircle className="w-16 h-16 text-blue-600" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold font-display text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
                <p className="text-gray-500 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <Link to="/">
                    <Button>
                        <Home className="w-4 h-4 mr-2" />
                        Go Back Home
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
