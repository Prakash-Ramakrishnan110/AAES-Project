import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

const Skeleton = ({ className = '', width, height, circle }: SkeletonProps) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={`bg-slate-200 ${circle ? 'rounded-full' : 'rounded-md'} ${className}`}
            style={{ width, height }}
        />
    );
};

export default Skeleton;
