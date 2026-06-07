import { getTeaStockMap, resolveTeaStatus } from './teaStatus';
import type { TeaStatus, TeaStockItem } from './teaStatus';
import teaStock from './tea-stock.json';
import prices from './prices.json';

export type PricesCategories = {
  id: number;
  bowl: number;
  gongfu: number; 
}
const teaPrices = prices as PricesCategories[];

export type TeaCard = {
  slug: string;
  title: string;
  description: string;
  source: string;
  status: TeaStatus | null;
  image: string | null;
  addedDate: Date | null;
};

export interface MenuItem {
  name: string;
  desc: string;
  price: string;
  tag: string | null;
}

export interface MenuCategory {
  id: string;
  title: string;
  icon: string;
  img: string;
  imgAlt: string;
  items: MenuItem[];
  legend: string;
}

const parseAddedDate = (dateStr: unknown): Date | null => {
  if (typeof dateStr !== 'string') return null;
  const [day, month, year] = dateStr.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};


const isTeaCard = (tea: TeaCard | null): tea is TeaCard => tea !== null;

// Pomocná funkce pro získání dat pro menu z MD + stock
function mergeTeaData(
  tea: TeaCard,
  stockMap: Map<string, TeaStockItem>,
  mostRecentDate: Date | null
): MenuItem {
  const stock = stockMap.get(tea.slug);
  const tags: string[] = [];
  if (stock) {
    // "New" tag
    if (mostRecentDate && stock.updatedAt && isSameDay(parseISODate(stock.updatedAt)!, mostRecentDate)) {
      tags.push('New');
    }
    // Sleva
    if (stock.discountPercent && stock.discountPercent > 0) {
      tags.push(`-${stock.discountPercent}%`);
    }

  }
  // Ceny
  const prices = teaPrices.find(p => p.id === stock?.price);
  const price = prices ? `${prices.bowl} / ${prices.gongfu} Kč` : '';
  return {
    name: tea.title,
    desc: tea.description,
    price,
    tag: tags.length > 0 ? tags.join(' ') : null,
  };
}

const parseISODate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  return new Date(dateStr);
};

const getMostRecentDate = (): Date | null => {
  const stock = teaStock as TeaStockItem[];
  const dates = stock
    .map(item => parseISODate(item.updatedAt))
    .filter((date): date is Date => date !== null);
  
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map(d => d.getTime())));
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
};

export async function generateLooseLeafMenu(baseUrl: string): Promise<MenuCategory> {
  const teas = await loadAllTeas(baseUrl);
  const stockMap = getTeaStockMap();
  const mostRecentDate = getMostRecentDate();
  const items: MenuItem[] = teas
    .filter(tea => tea.status !== 'neni')
    .map(tea => mergeTeaData(tea, stockMap, mostRecentDate));
  console.log('Generated menu items:', baseUrl);
  return {
    id: 'loose-leaf',
    title: 'čaj',
    icon: '🍃',
    img: `${baseUrl}teas.jpg`,
    imgAlt: 'čajové lístky',
    items: items,
    legend: 'miska / vícenalev',
  };
}

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
        description: frontmatter.description,
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
