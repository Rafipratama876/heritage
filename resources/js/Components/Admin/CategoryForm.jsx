import { cn } from '@/lib/cn';
import { useForm } from '@inertiajs/react';

// Slug auto-fills from the label on create (snake_case, matching the old
// hardcoded category values like "songket_tenun") — editable afterward,
// and left untouched once a slug already exists (edit mode).
function slugify(label) {
    return label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

export default function CategoryForm({ mode, category }) {
    const { data, setData, post, put, processing, errors } = useForm({
        slug: category?.slug ?? '',
        label: category?.label ?? '',
    });

    function updateLabel(value) {
        setData((prev) => ({
            ...prev,
            label: value,
            slug: mode === 'create' ? slugify(value) : prev.slug,
        }));
    }

    function submit(e) {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.categories.store'));
        } else {
            put(route('admin.categories.update', category.slug));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-lg space-y-6">
            <Field label="Label" error={errors.label}>
                <input
                    value={data.label}
                    onChange={(e) => updateLabel(e.target.value)}
                    className="input"
                    required
                />
                <p className="text-xs text-muted mt-1.5">
                    Shown to customers as a filter/badge, e.g. "Songket and Tenun".
                </p>
            </Field>

            <Field label="Slug" error={errors.slug}>
                <input
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    className="input font-mono"
                    required
                />
                <p className="text-xs text-muted mt-1.5">
                    Internal value stored on products — lowercase letters, numbers, and underscores
                    only. Changing this on an existing category does not update products already
                    using the old slug.
                </p>
            </Field>

            <button
                type="submit"
                disabled={processing}
                className={cn('btn-primary !py-2.5 !px-6 text-sm', processing && 'opacity-60')}
            >
                {processing ? 'Saving…' : mode === 'create' ? 'Create Category' : 'Save Changes'}
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
