<?php

use App\Http\Controllers\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Admin\CollectionController as AdminCollectionController;
use App\Http\Controllers\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\TrackController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HeartbeatController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// robots.txt is a static file at public/robots.txt (a route here would
// never be reached — Laravel serves matching public/ files first).
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::get('/shipping', function () {
    return Inertia::render('Storefront/Shipping');
})->name('shipping');
Route::get('/our-story', function () {
    return Inertia::render('Storefront/OurStory');
})->name('our-story');

Route::get('/api/products/search', [ProductController::class, 'search'])->name('products.search');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

Route::get('/collections', [CollectionController::class, 'index'])->name('collections.index');
Route::get('/collections/{slug}', [CollectionController::class, 'show'])->name('collections.show');

Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');

// No email-verification flow exists (the old system never had one) — the
// 'verified' middleware is intentionally left off here.
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Pinged every 60s by the frontend while a user is logged in, so the
    // admin dashboard can report an accurate "online now" count.
    Route::post('/heartbeat', [HeartbeatController::class, 'store'])->name('heartbeat');
});

// JSON endpoints for the cart/wishlist React providers — session-authenticated
// (no token to manage client-side), CSRF handled automatically by axios
// reading Laravel's XSRF-TOKEN cookie (wired up in resources/js/bootstrap.js).
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::patch('/cart/items/{item}', [CartController::class, 'update']);
    Route::delete('/cart/items/{item}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/items', [WishlistController::class, 'store']);
    Route::delete('/wishlist/items/{product}', [WishlistController::class, 'destroy']);
});

// Public, fire-and-forget analytics tracking — no auth required.
Route::prefix('api/track')->group(function () {
    Route::post('/', [TrackController::class, 'pageView']);
    Route::post('/search', [TrackController::class, 'search']);
    Route::post('/product', [TrackController::class, 'product']);
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Admin/Dashboard', [
            'counts' => [
                'products' => \App\Models\Product::count(),
                'collections' => \App\Models\Collection::count(),
                'gallery' => \App\Models\GalleryItem::count(),
                'users' => \App\Models\User::count(),
            ],
        ]);
    })->name('dashboard');

    Route::post('/uploads/images', [AdminUploadController::class, 'images'])->name('uploads.images');
    Route::post('/uploads/video', [AdminUploadController::class, 'video'])->name('uploads.video');

    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
    Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product:slug}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product:slug}', [AdminProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product:slug}', [AdminProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/collections', [AdminCollectionController::class, 'index'])->name('collections.index');
    Route::get('/collections/create', [AdminCollectionController::class, 'create'])->name('collections.create');
    Route::post('/collections', [AdminCollectionController::class, 'store'])->name('collections.store');
    Route::get('/collections/{collection:slug}/edit', [AdminCollectionController::class, 'edit'])->name('collections.edit');
    Route::put('/collections/{collection:slug}', [AdminCollectionController::class, 'update'])->name('collections.update');
    Route::delete('/collections/{collection:slug}', [AdminCollectionController::class, 'destroy'])->name('collections.destroy');

    Route::get('/gallery', [AdminGalleryController::class, 'index'])->name('gallery.index');
    Route::get('/gallery/create', [AdminGalleryController::class, 'create'])->name('gallery.create');
    Route::post('/gallery', [AdminGalleryController::class, 'store'])->name('gallery.store');
    Route::get('/gallery/{galleryItem:slug}/edit', [AdminGalleryController::class, 'edit'])->name('gallery.edit');
    Route::put('/gallery/{galleryItem:slug}', [AdminGalleryController::class, 'update'])->name('gallery.update');
    Route::delete('/gallery/{galleryItem:slug}', [AdminGalleryController::class, 'destroy'])->name('gallery.destroy');

    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('/insight', function () {
        return Inertia::render('Admin/Insight/Index');
    })->name('insight.index');
    Route::get('/insight/overview', [AdminAnalyticsController::class, 'overview'])->name('insight.overview');
    Route::get('/insight/visitors', [AdminAnalyticsController::class, 'visitors'])->name('insight.visitors');
    Route::get('/insight/behavior', [AdminAnalyticsController::class, 'behavior'])->name('insight.behavior');
    Route::get('/insight/search', [AdminAnalyticsController::class, 'search'])->name('insight.search');
    Route::get('/insight/products', [AdminAnalyticsController::class, 'products'])->name('insight.products');
    Route::get('/insight/ga4', [AdminAnalyticsController::class, 'ga4'])->name('insight.ga4');
});

require __DIR__.'/auth.php';
