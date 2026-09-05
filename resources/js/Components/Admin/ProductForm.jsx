import ImageUpload from '@/Components/Admin/ImageUpload';
import VideoUpload from '@/Components/Admin/VideoUpload';
import { cn } from '@/lib/cn';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { HiOutlineTrash, HiPlus } from 'react-icons/hi';

export default function ProductForm({ mode, product, categories, collections }) {
    const { data, setData, post, put, processing, errors } = useForm({
        code: product?.code ?? '',
        slug: product?.slug ?? '',
        name: product?.name ?? '',
        price: product?.price ?? '',
        price_usd: product?.price_usd ?? '',
        short_description: product?.short_description ?? '',
        description: product?.description ?? '',
        categories: product?.categories ?? [],
        collection_slugs: product?.collection_slugs ?? [],
        images: product?.images ?? [],
        video_url: product?.video_url ?? null,
        specifications: product?.specifications ?? [],
        featured: product?.featured ?? false,
        available: product?.available ?? true,
    });

    // "Price not available yet" — sets price to null instead of a number,
    // which the storefront shows as "Hubungi Kami" and hides Add to Cart
    // for (see resources/js/lib/format.js#hasPrice).
    const [noPrice, setNoPrice] = useState(mode === 'edit' && product?.price == null);

    function toggleNoPrice(checked) {
        setNoPrice(checked);
        setData('price', checked ? null : '');
    }

    function toggleArrayValue(field, value) {
        setData(
            field,
            data[field].includes(value)
                ? data[field].filter((v) => v !== value)
                : [...data[field], value]
        );
    }

    function updateSpec(idx, key, value) {
        const next = [...data.specifications];
        next[idx] = { ...next[idx], [key]: value };
        setData('specifications', next);
    }

    function removeSpec(idx) {
        setData('specifications', data.specifications.filter((_, i) => i !== idx));
    }

    function submit(e) {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.products.store'));
        } else {
            put(route('admin.products.update', product.slug));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-6">
            {errors.error && <p className="text-clay text-sm">{errors.error}</p>}

            <div className="grid grid-cols-2 gap-4">
                <Field label="Code" error={errors.code}>
                    <input
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        className="input"
                        required
                    />
                </Field>
                <Field label="Slug" error={errors.slug}>
                    <input
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        className="input"
                        required
                    />
                </Field>
            </div>

            <Field label="Name" error={errors.name}>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="input"
                    required
                />
            </Field>

            <Field label="Price (IDR)" error={errors.price}>
                <input
                    type="number"
                    min={0}
                    value={noPrice ? '' : data.price}
                    onChange={(e) => setData('price', Number(e.target.value))}
                    disabled={noPrice}
                    required={!noPrice}
                    className="input disabled:opacity-50"
                />
                <label className="flex items-center gap-2 text-sm text-ivory/80 mt-2">
                    <input
                        type="checkbox"
                        checked={noPrice}
                        onChange={(e) => toggleNoPrice(e.target.checked)}
                        className="accent-brass"
                    />
                    Price not available yet (shows "Hubungi Kami" and hides Add to Cart)
                </label>
            </Field>

            <Field label="Price (USD, optional)" error={errors.price_usd}>
                <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={data.price_usd}
                    onChange={(e) => setData('price_usd', e.target.value === '' ? '' : Number(e.target.value))}
                    className="input"
                    placeholder="e.g. 120.00"
                />
                <p className="text-xs text-muted mt-1.5">
                    Entered manually — not auto-converted from the IDR price above.
                </p>
            </Field>

            <Field label="Categories (select one or more)" error={errors.categories}>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            type="button"
                            key={cat.value}
                            onClick={() => toggleArrayValue('categories', cat.value)}
                            className={cn(
                                'text-xs px-3 py-1.5 border transition-colors',
                                data.categories.includes(cat.value)
                                    ? 'bg-brass border-brass text-canvas'
                                    : 'border-line text-ivory/70 hover:border-brass'
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="Collections (select one or more)" error={errors.collection_slugs}>
                <div className="flex flex-wrap gap-2">
                    {collections.map((c) => (
                        <button
                            type="button"
                            key={c.slug}
                            onClick={() => toggleArrayValue('collection_slugs', c.slug)}
                            className={cn(
                                'text-xs px-3 py-1.5 border transition-colors',
                                data.collection_slugs.includes(c.slug)
                                    ? 'bg-brass border-brass text-canvas'
                                    : 'border-line text-ivory/70 hover:border-brass'
                            )}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="Short Description" error={errors.short_description}>
                <input
                    value={data.short_description}
                    onChange={(e) => setData('short_description', e.target.value)}
                    className="input"
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

            <Field label="Images" error={errors.images}>
                <ImageUpload value={data.images} onChange={(v) => setData('images', v)} />
            </Field>

            <Field label="Product Video (optional)">
                <VideoUpload value={data.video_url} onChange={(v) => setData('video_url', v)} />
            </Field>

            <div>
                <label className="eyebrow mb-2 block">Specifications</label>
                <div className="space-y-2">
                    {data.specifications.map((spec, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                value={spec.label}
                                onChange={(e) => updateSpec(idx, 'label', e.target.value)}
                                placeholder="Material"
                                className="input flex-1"
                            />
                            <input
                                value={spec.value}
                                onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                                placeholder="100% cotton"
                                className="input flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => removeSpec(idx)}
                                className="text-ivory/50 hover:text-clay px-2"
                            >
                                <HiOutlineTrash />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() =>
                        setData('specifications', [...data.specifications, { label: '', value: '' }])
                    }
                    className="text-xs text-brass hover:text-ivory transition-colors mt-2 flex items-center gap-1"
                >
                    <HiPlus /> Add specification
                </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-ivory/80">
                <input
                    type="checkbox"
                    checked={data.featured}
                    onChange={(e) => setData('featured', e.target.checked)}
                    className="accent-brass"
                />
                Featured (shown on homepage)
            </label>
            <label className="flex items-center gap-2 text-sm text-ivory/80">
                <input
                    type="checkbox"
                    checked={!data.available}
                    onChange={(e) => setData('available', !e.target.checked)}
                    className="accent-clay"
                />
                Unavailable (hides Order/Add to Cart — no stock tracking, this is a manual switch)
            </label>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={processing}
                    className={cn('btn-primary !py-2.5 !px-6 text-sm', processing && 'opacity-60')}
                >
                    {processing ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
            </div>
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
