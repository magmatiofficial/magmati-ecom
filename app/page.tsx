import { getProducts } from '@/lib/serverProducts';
import { ProductsHydrator } from '@/components/layout/ProductsHydrator';
import { HomePageClient } from '@/components/home/HomePageClient';

export default async function HomePage() {
  const initialProducts = await getProducts();
  return (
    <ProductsHydrator initial={initialProducts}>
      <HomePageClient />
    </ProductsHydrator>
  );
}
