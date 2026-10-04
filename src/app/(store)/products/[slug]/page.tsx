import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { SaveButton } from "@/components/saved/save-button";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { EditorialImage } from "@/components/ui/editorial-image";
import { getProductBySlug, getProductSlugs } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import { productImageSrc } from "@/lib/images";
import { getCategoryName } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.shortDescription ?? product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

const breadcrumbLinkClass =
  "transition-colors duration-200 hover:text-charcoal";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const hasSpecSections = Boolean(
    product.details?.length || product.material || product.dimensions,
  );

  return (
    <Container className="py-10 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
          <li>
            <Link href="/shop" className={breadcrumbLinkClass}>
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/shop?category=${product.category}`}
              className={breadcrumbLinkClass}
            >
              {getCategoryName(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-charcoal">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <EditorialImage
            src={productImageSrc(product)}
            alt={product.name}
            ratioClass="aspect-4/5"
            sizes="(min-width: 1024px) 48vw, 100vw"
            priority
          />
          {/* Further gallery panels render here once the data has secondary images. */}
        </div>

        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            {getCategoryName(product.category)}
          </p>

          <h1 className="mt-3 font-display text-4xl sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-lg text-charcoal/80">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 max-w-md text-muted">{product.description}</p>

          <ProductPurchase
            productId={product.id}
            productName={product.name}
            stock={product.stock}
            sizes={product.sizes}
          />

          <div className="mt-6">
            <SaveButton
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
            />
          </div>
        </div>
      </div>

      {/* Shipping and Returns are omitted: no shipping or returns data exists yet. */}
      {hasSpecSections ? (
        <div className="mt-16 border-t border-line pt-10 sm:mt-20">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {product.details?.length ? (
              <section>
                <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                  Details
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-charcoal/80">
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {product.material ? (
              <section>
                <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                  Materials
                </h2>
                <p className="mt-4 text-sm text-charcoal/80">{product.material}</p>
              </section>
            ) : null}

            {product.dimensions ? (
              <section>
                <h2 className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                  Dimensions
                </h2>
                <p className="mt-4 text-sm text-charcoal/80">
                  {product.dimensions}
                </p>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </Container>
  );
}