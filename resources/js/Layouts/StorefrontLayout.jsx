import CartDrawer from '@/Components/CartDrawer';
import Footer from '@/Components/Footer';
import Navbar from '@/Components/Navbar';
import WishlistDrawer from '@/Components/WishlistDrawer';

export default function StorefrontLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-canvas text-ivory font-body">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />

            <CartDrawer />
            <WishlistDrawer />
        </div>
    );
}
