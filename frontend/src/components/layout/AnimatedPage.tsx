import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedPageProps {
    children: ReactNode;
    className?: string;
}

const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const AnimatedPage = ({ children, className = '' }: AnimatedPageProps) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
};
