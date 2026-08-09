export type CollectionSummary = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  parent?: CollectionSummary | null;
  children?: CollectionSummary[];
};

export type Category =
  | "Batik"
  | "Songket and Tenun"
  | "Kebaya"
  | "Accessories and Jewelry"
  | "Bag"
  | "Jewelry"
  | "Plate"
  | "Other Accessories";

export type Product = {
  id: string;
  code: string; // catalog code, e.g. RH-014
  slug: string;
  name: string;
  price: number;
  shortDescription: string;
  description: string;
  collections: string[]; // Collection slugs
  categories: Category[];
  images: string[];
  videoUrl?: string | null;
  specifications: { label: string; value: string }[];
  featured?: boolean;
  available: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN";
};

export type GalleryItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tag: "Exhibition" | "Visit" | "Event" | "Workshop" | "Showcase";
};

export type CartItem = {
  id: string; // cart item id (server), or productId for a not-yet-synced guest item
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};