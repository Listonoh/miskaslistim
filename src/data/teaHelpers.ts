import { getTeaStockMap, resolveTeaStatus } from './teaStatus';
import type { TeaStatus } from './teaStatus';

export type TeaCard = {
  slug: string;
  title: string;
  description: string;
  source: string;
  status: TeaStatus | null;
  image: string | null;
  addedDate: Date | null;
};

const parseAddedDate = (dateStr: unknown): Date | null => {
  if (typeof dateStr !== 'string') return null;
  const [day, month, year] = dateStr.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const isTeaCard = (tea: TeaCard | null): tea is TeaCard => tea !== null;

export async function loadAllTeas(baseUrl: string): Promise<TeaCard[]> {
  const stockMap = getTeaStockMap();
  const teaModules = Object.entries(
    import.meta.glob('../pages/teas/*.md', { eager: true })
  );

  return teaModules
    .map(([path, mod]) => {
      const slug = path.replace(/.*\//, '').replace(/\.md$/, '');
      if (slug === 'template' || slug === 'index') return null;

      const frontmatter = (mod as { frontmatter?: Record<string, unknown> }).frontmatter ?? {};
      const rawImage = typeof frontmatter.coverImage === 'string' ? frontmatter.coverImage : null;
      const image = rawImage ? `${baseUrl}${rawImage.replace(/^\/+/, '')}` : null;
      const status = resolveTeaStatus(stockMap.get(slug));

      return {
        slug,
        title: typeof frontmatter.title === 'string' ? frontmatter.title : slug,
        description:
          typeof frontmatter.description === 'string'
            ? frontmatter.description
            : 'Tea profile and brewing guide.',
        source: typeof frontmatter.source === 'string' ? frontmatter.source : 'Unknown source',
        status,
        image,
        addedDate: parseAddedDate(frontmatter.addedDate),
      };
    })
    .filter(isTeaCard)
    .sort((a, b) => {
      const timeA = a.addedDate?.getTime() ?? 0;
      const timeB = b.addedDate?.getTime() ?? 0;
      return timeB - timeA;
    });
}

export async function loadAvailableTeas(baseUrl: string, limit?: number): Promise<TeaCard[]> {
  const allTeas = await loadAllTeas(baseUrl);
  const availableTeas = allTeas.filter((tea) => tea.status !== 'neni');

  return typeof limit === 'number' ? availableTeas.slice(0, limit) : availableTeas;
}
