import { cn } from '@/lib/cn';
import axios from 'axios';
import { useRef, useState } from 'react';
import { HiOutlineTrash, HiOutlineUpload } from 'react-icons/hi';

export default function VideoUpload({ value, onChange }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError('');
        try {
            const { data } = await axios.post(route('admin.uploads.video'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onChange(data.url);
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div>
            {value && (
                <div className="relative w-48 mb-3 bg-surface border border-line group">
                    <video src={value} controls className="w-full aspect-video bg-black" />
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute top-1 right-1 bg-canvas/80 p-1.5 text-clay opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <HiOutlineTrash />
                    </button>
                </div>
            )}

            {error && <p className="text-clay text-xs mb-2">{error}</p>}

            <div className="flex items-center gap-3">
                <input
                    ref={inputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                    onChange={handleFile}
                />
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className={cn('btn-outline !py-2 !px-4 text-xs', uploading && 'opacity-60 pointer-events-none')}
                >
                    <HiOutlineUpload />
                    {uploading ? 'Uploading…' : value ? 'Replace video' : 'Upload video'}
                </button>
            </div>
            <p className="text-xs text-muted mt-1.5">MP4, WEBM, OGG, or MOV — up to 100MB. Optional.</p>
        </div>
    );
}
