import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import VisitorTracker from './Components/VisitorTracker';
import { CartProvider } from './Providers/CartProvider';
import { ToastProvider } from './Providers/ToastProvider';
import { WishlistProvider } from './Providers/WishlistProvider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title && title !== appName ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ).then((module) => {
            // Global providers, applied via Inertia's persistent-layout hook
            // so they render *inside* the Inertia page context (usePage()
            // needs that context to exist already).
            const page = module.default;
            const existingLayout = page.layout;
            page.layout =
                existingLayout ||
                ((children) => (
                    <ToastProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <VisitorTracker />
                                {children}
                            </WishlistProvider>
                        </CartProvider>
                    </ToastProvider>
                ));
            return module;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
