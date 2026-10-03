import { Search } from "lucide-react";
import Link from "next/link";

import { CATEGORIES } from "@/lib/catalogue";
import { SORT_OPTIONS, filterLinkClass, shopHref } from "@/lib/shop-query";
import type { ShopQuery } from "@/lib/shop-query";

/**
 * Search, category filter and sort for the shop.
 * Everything is a real link or a real GET form, so it works without JavaScript.
 */
export function ShopControls({
  query,
  resultCount,
}: {
  query: ShopQuery;
  resultCount: number;
}) {
  return (
    <>
      <form
        action="/shop"
        method="get"
        role="search"
        className="mt-8 flex max-w-xl items-end gap-3"
      >
        {query.category ? (
          <input type="hidden" name="category" value={query.category} />
        ) : null}
        {query.sort !== "newest" ? (
          <input type="hidden" name="sort" value={query.sort} />
        ) : null}

        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-[0.68rem] uppercase tracking-[0.22em] text-muted"
          >
            Search
          </label>
          <input
            id="search"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Search the collection"
            className="mt-2 h-11 w-full border-b border-line bg-transparent text-sm placeholder:text-charcoal/40"
          />
        </div>

        <button
          type="submit"
          aria-label="Search"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-b border-line transition-colors duration-200 hover:border-charcoal hover:text-olive"
        >
          <Search size={22} strokeWidth={1.5} aria-hidden />
        </button>
      </form>

      <nav aria-label="Filter by category" className="mt-10">
        <ul className="flex flex-wrap gap-x-6">
          <li>
            <Link
              href={shopHref(query, { category: "" })}
              aria-current={query.category === "" ? "page" : undefined}
              className={filterLinkClass(query.category === "")}
            >
              All
            </Link>
          </li>
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={shopHref(query, { category: category.slug })}
                aria-current={query.category === category.slug ? "page" : undefined}
                className={filterLinkClass(query.category === category.slug)}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6">
        <p className="text-sm text-muted">
          {resultCount} {resultCount === 1 ? "piece" : "pieces"}
        </p>

        <nav aria-label="Sort products">
          <ul className="flex flex-wrap gap-x-6">
            {SORT_OPTIONS.map((option) => {
              const isActive = query.sort === option.value;
              return (
                <li key={option.value}>
                  <Link
                    href={shopHref(query, { sort: option.value })}
                    aria-current={isActive ? "true" : undefined}
                    className={filterLinkClass(isActive)}
                  >
                    {option.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}