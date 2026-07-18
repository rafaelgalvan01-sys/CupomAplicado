import Image from "next/image";
import Link from "next/link";
import type { Guide } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { truncateText } from "@/lib/utils";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link href={`/guias/${guide.slug}`} className="block">
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand/40">
        <CardHeader>
          {guide.image_url ? (
            <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={guide.image_url}
                alt={guide.image_alt ?? ""}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="mb-2 text-3xl" aria-hidden>
              💡
            </div>
          )}
          <CardTitle className="text-foreground group-hover:text-brand-text">{guide.title}</CardTitle>
          {guide.intro && <CardDescription>{truncateText(guide.intro, 110)}</CardDescription>}
        </CardHeader>
      </Card>
    </Link>
  );
}
