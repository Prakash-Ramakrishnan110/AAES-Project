import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReadOnlyBannerProps {
  message?: string;
}

const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({ 
  message = "You are viewing historical data from a past semester. All modifications are disabled." 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3 mb-6 shadow-sm"
    >
      <div className="bg-amber-500 p-2 rounded-lg">
        <Lock className="w-4 h-4 text-white" />
      </div>
      <div>
        <h4 className="text-amber-900 font-semibold text-sm">Read-Only Mode Active</h4>
        <p className="text-amber-700 text-xs font-medium">{message}</p>
      </div>
    </motion.div>
  );
};

export default ReadOnlyBanner;

