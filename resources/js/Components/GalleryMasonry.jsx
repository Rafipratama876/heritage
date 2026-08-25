import Lightbox from '@/Components/Lightbox';
import Reveal from '@/Components/Reveal';
import VideoLightbox from '@/Components/VideoLightbox';
import { useState } from 'react';
import { HiPlay } from 'react-icons/hi';

export default function GalleryMasonry({ items }) {
    const [openImageIndex, setOpenImageIndex] = useState(null);
    const [openVideoItem, setOpenVideoItem] = useState(null);

    // Lightbox only knows how to swipe between images, so it only ever sees
    // the image-bearing items — video items are played in their own modal.
    const imageItems = items.filter((i) => i.image);
    const images = imageItems.map((i) => i.image);

    function openItem(item) {
        if (item.video_url) {
            setOpenVideoItem(item);
        } else {
            setOpenImageIndex(imageItems.findIndex((i) => i.slug === item.slug));
        }
    }

    return (
        <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
                {items.map((item, i) => (
                    <Reveal key={item.slug} delay={(i % 6) * 0.05} className="break-inside-avoid">
                        <button
                            onClick={() => openItem(item)}
                            className="relative block w-full overflow-hidden label-frame group text-left"
                            style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '1/1' : '4/5' }}
                            aria-label={item.video_url ? `Play ${item.title}` : `Enlarge ${item.title}`}
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <video
                                    src={item.video_url}
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}
                            {item.video_url && (
                                <div className="absolute inset-0 flex items-center justify-center bg-canvas/20">
                                    <span className="flex items-center justify-center w-14 h-14 rounded-full bg-canvas/60 text-ivory text-2xl backdrop-blur-sm group-hover:bg-brass group-hover:text-canvas transition-colors">
                                        <HiPlay className="translate-x-0.5" />
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                <span className="eyebrow">
                                    {item.tag?.label ?? item.tag} · {item.date}
                                </span>
                                <h3 className="font-display text-lg text-ivory mt-1">{item.title}</h3>
                            </div>
                        </button>
                    </Reveal>
                ))}
            </div>

            {openImageIndex !== null && (
                <Lightbox
                    images={images}
                    index={openImageIndex}
                    alt={imageItems[openImageIndex].title}
                    onClose={() => setOpenImageIndex(null)}
                    onNavigate={setOpenImageIndex}
                />
            )}

            {openVideoItem && (
                <VideoLightbox
                    src={openVideoItem.video_url}
                    alt={openVideoItem.title}
                    onClose={() => setOpenVideoItem(null)}
                />
            )}
        </>
    );
}
