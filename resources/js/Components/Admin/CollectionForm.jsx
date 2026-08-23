import ImageUpload from '@/Components/Admin/ImageUpload';
import { cn } from '@/lib/cn';
import { useForm } from '@inertiajs/react';

export default function CollectionForm({ mode, collection, parentOptions }) {
    const { data, setData, post, put, processing, errors } = useForm({
        slug: collection?.slug ?? '',
        name: collection?.name ?? '',
        tagline: collection?.tagline ?? '',
        description: collection?.description ?? '',
        image: collection?.image ?? '',
        parent_id: collection?.parent_id ?? '',
    });

    function submit(e) {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.collections.store'));
        } else {
            put(route('admin.collections.update', collection.slug));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-xl space-y-6">
            {errors.parent_id && <p className="text-clay text-sm">{errors.parent_id}</p>}

            <Field label="Slug" error={errors.slug}>
                <input
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    className="input"
                    required
                />
            </Field>

            <Field label="Name" error={errors.name}>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="input"
                    required
                />
            </Field>

            <Field label="Parent Collection (optional)">
                <select
                    value={data.parent_id ?? ''}
                    onChange={(e) => setData('parent_id', e.target.value || '')}
                    className="input"
                >
                    <option value="">— None (top-level) —</option>
                    {parentOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-muted mt-1.5">
                    e.g. set "Batik Cap" with parent "Heritage Batik" to nest it as a sub-collection.
                </p>
            </Field>

            <Field label="Tagline" error={errors.tagline}>
                <input
                    value={data.tagline}
                    onChange={(e) => setData('tagline', e.target.value)}
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

            <Field label="Image" error={errors.image}>
                <ImageUpload
                    multiple={false}
                    value={data.image ? [data.image] : []}
                    onChange={(urls) => setData('image', urls[0] ?? '')}
                />
            </Field>

            <button
                type="submit"
                disabled={processing}
                className={cn('btn-primary !py-2.5 !px-6 text-sm', processing && 'opacity-60')}
            >
                {processing ? 'Saving…' : mode === 'create' ? 'Create Collection' : 'Save Changes'}
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
