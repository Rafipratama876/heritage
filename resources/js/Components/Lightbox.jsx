import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';

export default function Lightbox({ images, index, alt, onClose, onNavigate }) {
    const goPrev = useCallback(
        () => onNavigate((index - 1 + images.length) % images.length),
        [index, images.length, onNavigate]
    );
    const goNext = useCallback(
        () => onNavigate((index + 1) % images.length),
        [index, images.length, onNavigate]
    );

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, goPrev, goNext]);

    function handleDragEnd(_, info) {
        if (info.offset.x > 60) goPrev();
        else if (info.offset.x < -60) goNext();
    }

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

                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goPrev();
                            }}
                            aria-label="Previous image"
                            className="absolute left-2 sm:left-6 text-ivory text-3xl p-2 hover:text-brass transition-colors z-10"
                        >
                            <HiChevronLeft />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goNext();
                            }}
                            aria-label="Next image"
                            className="absolute right-2 sm:right-6 text-ivory text-3xl p-2 hover:text-brass transition-colors z-10"
                        >
                            <HiChevronRight />
                        </button>
                    </>
                )}

                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    drag={images.length > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-[90vw] h-[70vh] sm:w-[80vw] sm:h-[80vh] max-w-4xl"
                >
                    <img
                        src={images[index]}
                        alt={alt}
                        className="w-full h-full object-contain select-none"
                    />
                </motion.div>

                {images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-muted">
                        {index + 1} / {images.length}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
