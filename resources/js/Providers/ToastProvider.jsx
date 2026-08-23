import { cn } from '@/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useState } from 'react';
import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineInformationCircle,
    HiX,
} from 'react-icons/hi';

const ToastContext = createContext(null);

const ICONS = {
    error: HiOutlineExclamationCircle,
    success: HiOutlineCheckCircle,
    info: HiOutlineInformationCircle,
};

// Errors stay up longer than success/info — they're the ones a person
// actually needs time to read and act on.
const DURATIONS = { error: 8000, success: 4000, info: 5000 };

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message, type = 'error') => {
            const id = Math.random().toString(36).slice(2);
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => dismissToast(id), DURATIONS[type]);
        },
        [dismissToast]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed top-24 right-4 z-[200] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const Icon = ICONS[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 40 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    'pointer-events-auto flex items-start gap-3 border bg-canvas px-4 py-3.5 shadow-lg',
                                    toast.type === 'error' && 'border-clay',
                                    toast.type === 'success' && 'border-brass',
                                    toast.type === 'info' && 'border-line'
                                )}
                                role="alert"
                            >
                                <Icon
                                    className={cn(
                                        'text-xl shrink-0 mt-0.5',
                                        toast.type === 'error' && 'text-clay',
                                        toast.type === 'success' && 'text-brass',
                                        toast.type === 'info' && 'text-ivory/70'
                                    )}
                                />
                                <p className="text-sm text-ivory leading-snug flex-1">{toast.message}</p>
                                <button
                                    type="button"
                                    onClick={() => dismissToast(toast.id)}
                                    aria-label="Dismiss"
                                    className="text-ivory/50 hover:text-ivory transition-colors shrink-0"
                                >
                                    <HiX />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}
