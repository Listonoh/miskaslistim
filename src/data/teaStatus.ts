import teaStock from './tea-stock.json';

export type TeaStatus = 'skladem' | 'skoro dopité' | 'pripravuje se' | 'neni';

export type TeaStockItem = {
  slug: string;
  name?: string;
  description?: string;
  status: TeaStatus;
  amountGrams?: number;
  thresholdGrams?: number;
  updatedAt?: string;
  price?: number;
  discountPercent?: number;
};

const stock = teaStock as TeaStockItem[];


export function getTeaStockMap(): Map<string, TeaStockItem> {
  return new Map(stock.map((item) => [item.slug, item]));
}

export function resolveTeaStatus(item?: TeaStockItem): TeaStatus | null {
  if (!item) return null;

  const { status, amountGrams, thresholdGrams=100 } = item;

  if (typeof amountGrams === 'number' && amountGrams <= 0) return 'neni';
  if (status === 'skladem' && typeof amountGrams === 'number' && typeof thresholdGrams === 'number' && amountGrams <= thresholdGrams) {
    return 'skoro dopité';
  }

  return status;
}

export function normalizeStatusLabel(status?: string | null): string {
  const value = (status ?? '').trim().toLowerCase();

  if (value === 'in stock' || value === 'available' || value === 'skladem') return 'Skladem';
  if (value === 'low stock' || value === 'almost out' || value === 'skoro dopite' || value === 'skoro dopité') return 'Skoro dopité';
  if (value === 'preparing' || value === 'pripravuje se') return 'Pripravuje se';
  if (value === 'out of stock' || value === 'sold out' || value === 'neni' || value === 'vyprodano') return 'Neni';

  return status ?? '';
}

export function statusClassByLabel(label: string): string {
  if (label === 'Skladem') return 'tea-hero__availability--in-stock';
  if (label === 'Skoro dopité') return 'tea-hero__availability--low-stock';
  if (label === 'Pripravuje se') return 'tea-hero__availability--preparing';
  if (label === 'Neni' || label === 'Vyprodano') return 'tea-hero__availability--out-of-stock';

  return 'tea-hero__availability--on-request';
}
