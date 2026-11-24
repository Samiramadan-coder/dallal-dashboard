import { getCategories } from "@/lib/categories";
import SectionsSwitcher from "@/components/cms/categories/sections-switcher";

export default async function Page() {
  const categories = await getCategories();

  return <SectionsSwitcher categories={categories} />;
}
