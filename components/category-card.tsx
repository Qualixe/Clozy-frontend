import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  productCount: number;
};

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/collections/${category.slug}`} className="group">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-base font-medium text-foreground group-hover:underline underline-offset-4">
          {category.name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {category.productCount} product{category.productCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

export default CategoryCard;
