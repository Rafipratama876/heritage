import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

// Single-video playback overlay — a simpler sibling to Lightbox.jsx for the
// gallery's video items, which just need play/close, not swipe-navigation.
export default function VideoLightbox({ src, alt, onClose }) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[100] bg-canvas/97 backdrop-blur-sm flex items-center justify-center"
                role="dialog"
                aria-modal="true"
                aria-label={alt}
                onClick={onClose}
            >
                <button
                    onClick={onClose}
                    aria-label="Close preview"
                    className="absolute top-5 right-5 text-ivory text-3xl p-2 hover:text-brass transition-colors z-10"
                >
                    <HiX />
                </button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-[90vw] h-[70vh] sm:w-[80vw] sm:h-[80vh] max-w-4xl"
                >
                    <video
                        src={src}
                        controls
                        autoPlay
                        className="w-full h-full object-contain select-none"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
