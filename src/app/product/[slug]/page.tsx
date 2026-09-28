import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/db";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Fragrance Not Found",
      description: "The requested fragrance could not be located in our collection.",
    };
  }

  const pageTitle = `${product.name} by ${product.brand}`;
  const keywords = [
    product.name,
    product.brand,
    product.category,
    product.concentration,
    ...product.notes.split(",").map((n) => n.trim()),
    "luxury perfume",
    "authentic fragrance",
  ];

  return {
    title: pageTitle,
    description: product.description,
    keywords,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${pageTitle} | Lumière Parfums`,
      description: product.description,
      url: `https://lumiere-parfums-mu.vercel.app/product/${product.slug}`,
      siteName: "Lumière Parfums",
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: `${product.brand} ${product.name}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | Lumière Parfums`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts({ category: product.category });
  const related = all
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [`https://lumiere-parfums-mu.vercel.app${product.image}`],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://lumiere-parfums-mu.vercel.app/product/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "Lumière Parfums",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 10,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
