"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Option = { slug: string; name: string };

type Props = {
  stores: Option[];
  categories: Option[];
  selectedStore?: string;
  selectedCategory?: string;
};

// Valor interno pra opção "todas" (o base-ui Select não usa string vazia como
// "sem seleção", então uso um sentinela e traduzo pra remover o parâmetro).
const ALL = "__all__";

export function CouponFilters({ stores, categories, selectedStore, selectedCategory }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Trocar de filtro volta pra primeira página da listagem.
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={selectedCategory ?? ALL}
        onValueChange={(value) => setParam("categoria", value === ALL ? null : (value as string))}
      >
        <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por categoria">
          <SelectValue>
            {(value) =>
              value === ALL
                ? "Todas as categorias"
                : (categories.find((c) => c.slug === value)?.name ?? "Categoria")
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.slug} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedStore ?? ALL}
        onValueChange={(value) => setParam("loja", value === ALL ? null : (value as string))}
      >
        <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por marca">
          <SelectValue>
            {(value) =>
              value === ALL
                ? "Todas as marcas"
                : (stores.find((s) => s.slug === value)?.name ?? "Marca")
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as marcas</SelectItem>
          {stores.map((store) => (
            <SelectItem key={store.slug} value={store.slug}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
