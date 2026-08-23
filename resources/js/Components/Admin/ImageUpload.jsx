import { cn } from '@/lib/cn';
import axios from 'axios';
import { useRef, useState } from 'react';
import { HiOutlineTrash, HiOutlineUpload, HiPlus } from 'react-icons/hi';

export default function ImageUpload({ value, onChange, multiple = true }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [urlDraft, setUrlDraft] = useState('');

    async function handleFiles(e) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach((file) => formData.append('files[]', file));

        setUploading(true);
        setError('');
        try {
            const { data } = await axios.post(route('admin.uploads.images'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const urls = multiple ? [...value, ...data.urls] : data.urls.slice(0, 1);
            onChange(urls);
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    function addUrl() {
        if (!urlDraft.trim()) return;
        onChange(multiple ? [...value, urlDraft.trim()] : [urlDraft.trim()]);
        setUrlDraft('');
    }

    function removeAt(idx) {
        onChange(value.filter((_, i) => i !== idx));
    }

    return (
        <div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                    {value.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 bg-surface border border-line group">
                            <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeAt(idx)}
                                className="absolute inset-0 bg-canvas/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-clay"
                            >
                                <HiOutlineTrash />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {error && <p className="text-clay text-xs mb-2">{error}</p>}

            <div className="flex items-center gap-3 flex-wrap">
                <input
                    ref={inputRef}
                    type="file"
                    multiple={multiple}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFiles}
                />
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className={cn('btn-outline !py-2 !px-4 text-xs', uploading && 'opacity-60 pointer-events-none')}
                >
                    <HiOutlineUpload />
                    {uploading ? 'Uploading…' : `Upload image${multiple ? '(s)' : ''}`}
                </button>
                <span className="text-xs text-muted">or</span>
                <input
                    type="url"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    placeholder="Paste an image URL"
                    className="input !py-2 text-xs w-56"
                />
                <button
                    type="button"
                    onClick={addUrl}
                    className="text-xs text-brass hover:text-ivory transition-colors flex items-center gap-1"
                >
                    <HiPlus /> Add
                </button>
            </div>
        </div>
    );
}
