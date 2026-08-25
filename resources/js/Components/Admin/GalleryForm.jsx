import ImageUpload from '@/Components/Admin/ImageUpload';
import VideoUpload from '@/Components/Admin/VideoUpload';
import { cn } from '@/lib/cn';
import { useForm } from '@inertiajs/react';

export default function GalleryForm({ mode, item, tags }) {
    const { data, setData, post, put, processing, errors } = useForm({
        slug: item?.slug ?? '',
        title: item?.title ?? '',
        description: item?.description ?? '',
        date: item?.date ?? '',
        image: item?.image ?? '',
        video_url: item?.video_url ?? null,
        tag: item?.tag ?? tags[0]?.value ?? '',
    });

    function submit(e) {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.gallery.store'));
        } else {
            put(route('admin.gallery.update', item.slug));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-xl space-y-6">
            <Field label="Slug" error={errors.slug}>
                <input
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    className="input"
                    required
                />
            </Field>

            <Field label="Title" error={errors.title}>
                <input
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="input"
                    required
                />
            </Field>

            <Field label="Description" error={errors.description}>
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="input"
                    rows={4}
                />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Date" error={errors.date}>
                    <input
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                        placeholder="March 2026"
                        className="input"
                    />
                </Field>
                <Field label="Tag" error={errors.tag}>
                    <select
                        value={data.tag}
                        onChange={(e) => setData('tag', e.target.value)}
                        className="input"
                    >
                        {tags.map((tag) => (
                            <option key={tag.value} value={tag.value}>
                                {tag.label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Image" error={errors.image}>
                <ImageUpload
                    multiple={false}
                    value={data.image ? [data.image] : []}
                    onChange={(urls) => setData('image', urls[0] ?? '')}
                />
                <p className="text-xs text-muted mt-1.5">
                    Used as the thumbnail everywhere, and as the poster frame if this item is a
                    video. At least an image or a video below is required.
                </p>
            </Field>

            <Field label="Video (optional)">
                <VideoUpload value={data.video_url} onChange={(v) => setData('video_url', v)} />
            </Field>

            <button
                type="submit"
                disabled={processing}
                className={cn('btn-primary !py-2.5 !px-6 text-sm', processing && 'opacity-60')}
            >
                {processing ? 'Saving…' : mode === 'create' ? 'Create Item' : 'Save Changes'}
            </button>
        </form>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="eyebrow mb-2 block">{label}</label>
            {children}
            {error && <p className="text-clay text-sm mt-1">{error}</p>}
        </div>
    );
}
