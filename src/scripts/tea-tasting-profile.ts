import categories from '../data/tea-taste-profile.json';

type NoteKind = 'subcategory' | 'tasteNote';
type ProfileCategory = {
  id: string;
  category: string;
  color: string;
  score: number;
  subcategories: string[];
  tasteNotes: string[];
};

const chart = document.querySelector<SVGSVGElement>('#taste-chart');
const downloadPngButton = document.querySelector<HTMLButtonElement>('#download-png');
const downloadJsonButton = document.querySelector<HTMLButtonElement>('#download-json');
const exportStatus = document.querySelector<HTMLParagraphElement>('#export-status');
const chartCenter = 260;
const chartRadius = 150;

const escapeXml = (text: string): string =>
  text.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[character] ?? character);

const getPoint = (index: number, radius: number): [number, number] => {
  const angle = (-67.5 + index * 360 / categories.length) * Math.PI / 180;
  return [
    chartCenter + Math.cos(angle) * radius,
    chartCenter + Math.sin(angle) * radius,
  ];
};

const pointsAttribute = (points: [number, number][]): string =>
  points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const getProfile = (): ProfileCategory[] =>
  categories.map((category) => {
    const slider = document.querySelector<HTMLInputElement>(`#score-${category.id}`);
    const selectedNotes = document.querySelectorAll<HTMLInputElement>(
      `input[data-category-id="${category.id}"][data-note-kind]:checked`,
    );
    const notesByKind: Record<NoteKind, string[]> = {
      subcategory: [],
      tasteNote: [],
    };

    selectedNotes.forEach((note) => {
      const kind = note.dataset.noteKind;
      if (kind === 'subcategory' || kind === 'tasteNote') notesByKind[kind].push(note.value);
    });

    return {
      id: category.id,
      category: category.label,
      color: category.color,
      score: Number(slider?.value ?? 0),
      subcategories: notesByKind.subcategory,
      tasteNotes: notesByKind.tasteNote,
    };
  });

const renderChart = (): void => {
  if (!chart) return;

  const profile = getProfile();
  const grid = [1, 2, 3, 4, 5].map((level) =>
    `<polygon points="${pointsAttribute(categories.map((_, index) => getPoint(index, chartRadius * level / 5)))}" fill="none" stroke="#e4d8c8" stroke-width="1" />`,
  ).join('');
  const axes = categories.map((category, index) => {
    const [x, y] = getPoint(index, chartRadius);
    return `<line x1="${chartCenter}" y1="${chartCenter}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${category.color}" stroke-opacity=".62" stroke-width="1.5" />`;
  }).join('');
  const dataPoints = profile.map((item, index) => getPoint(index, chartRadius * item.score / 5));
  const labels = categories.map((category, index) => {
    const [x, y] = getPoint(index, 196);
    const anchor = x < chartCenter - 20 ? 'end' : x > chartCenter + 20 ? 'start' : 'middle';
    const baseline = y < chartCenter - 20 ? 'auto' : y > chartCenter + 20 ? 'hanging' : 'middle';
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${category.color}" font-family="Lato, Arial, sans-serif" font-size="15" font-weight="700" text-anchor="${anchor}" dominant-baseline="${baseline}">${escapeXml(category.label)}</text>`;
  }).join('');
  const dots = dataPoints.map(([x, y], index) =>
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${categories[index].color}" stroke="#fffaf4" stroke-width="2.5" />`,
  ).join('');

  chart.innerHTML = `
    <defs>
      <linearGradient id="taste-area" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c8956c" stop-opacity=".5" />
        <stop offset="100%" stop-color="#71805b" stop-opacity=".38" />
      </linearGradient>
    </defs>
    ${grid}
    ${axes}
    <polygon points="${pointsAttribute(dataPoints)}" fill="url(#taste-area)" stroke="#9b6645" stroke-width="2.5" stroke-linejoin="round" />
    ${dots}
    ${labels}
  `;
};

const buildExportSvg = (profile: ProfileCategory[]): { svg: string; height: number } => {
  const grid = [1, 2, 3, 4, 5].map((level) =>
    `<polygon points="${pointsAttribute(categories.map((_, index) => getPoint(index, chartRadius * level / 5)))}" fill="none" stroke="#e4d8c8" stroke-width="1" />`,
  ).join('');
  const axes = categories.map((category, index) => {
    const [x, y] = getPoint(index, chartRadius);
    return `<line x1="${chartCenter}" y1="${chartCenter}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${category.color}" stroke-opacity=".62" stroke-width="1.5" />`;
  }).join('');
  const dataPoints = profile.map((item, index) => getPoint(index, chartRadius * item.score / 5));
  const labels = categories.map((category, index) => {
    const [x, y] = getPoint(index, 196);
    const anchor = x < chartCenter - 20 ? 'end' : x > chartCenter + 20 ? 'start' : 'middle';
    const baseline = y < chartCenter - 20 ? 'auto' : y > chartCenter + 20 ? 'hanging' : 'middle';
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${category.color}" font-family="Arial, sans-serif" font-size="15" font-weight="700" text-anchor="${anchor}" dominant-baseline="${baseline}">${escapeXml(category.label)}</text>`;
  }).join('');
  const dots = dataPoints.map(([x, y], index) =>
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${categories[index].color}" stroke="#fffaf4" stroke-width="2.5" />`,
  ).join('');
  let noteTop = 0;
  const noteRows = profile.map((item) => {
    const noteText = [
      item.subcategories.length ? `Subcategories: ${item.subcategories.join(', ')}` : '',
      item.tasteNotes.length ? `Taste notes: ${item.tasteNotes.join(', ')}` : '',
    ].filter(Boolean).join(' · ') || 'No notes selected yet';
    const lines: string[] = [];
    noteText.split(' ').forEach((word) => {
      const previousLine = lines.at(-1);
      if (!previousLine || `${previousLine} ${word}`.length > 52) lines.push(word);
      else lines[lines.length - 1] = `${previousLine} ${word}`;
    });
    const rowHeight = Math.max(92, lines.length * 21 + 45);
    const text = lines.map((line, lineIndex) =>
      `<text x="0" y="${32 + lineIndex * 21}" fill="#6a594a" font-family="Arial, sans-serif" font-size="15">${escapeXml(line)}</text>`,
    ).join('');
    const row = `<g transform="translate(0 ${noteTop})">
      <text x="0" y="0" fill="${item.color}" font-family="Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(item.category)}</text>
      <text x="475" y="0" fill="#795d47" font-family="Arial, sans-serif" font-size="15" text-anchor="end">${item.score} / 5</text>
      ${text}
    </g>`;
    noteTop += rowHeight;
    return row;
  }).join('');
  const height = Math.max(760, noteTop + 265);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}">
    <defs>
      <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fdf6ed" />
        <stop offset="100%" stop-color="#f3e8d2" />
      </linearGradient>
      <linearGradient id="area" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c8956c" stop-opacity=".5" />
        <stop offset="100%" stop-color="#71805b" stop-opacity=".38" />
      </linearGradient>
    </defs>
    <rect width="1200" height="${height}" fill="url(#paper)" />
    <text x="55" y="58" fill="#5c3d2e" font-family="Georgia, serif" font-size="34" font-weight="700">Tea tasting profile</text>
    <text x="57" y="88" fill="#8d7159" font-family="Arial, sans-serif" font-size="15">A little map of what you found in your cup</text>
    <g transform="translate(20 120)">
      ${grid}${axes}
      <polygon points="${pointsAttribute(dataPoints)}" fill="url(#area)" stroke="#9b6645" stroke-width="2.5" stroke-linejoin="round" />
      ${dots}${labels}
    </g>
    <line x1="590" y1="125" x2="590" y2="700" stroke="#d8c8b3" />
    <text x="635" y="150" fill="#5c3d2e" font-family="Georgia, serif" font-size="23" font-weight="700">Selected notes</text>
    <g transform="translate(635 185)">${noteRows}</g>
    <text x="55" y="${height - 35}" fill="#8d7159" font-family="Arial, sans-serif" font-size="12">čajovna miska s listím · tea tasting</text>
  </svg>`;
  return { svg, height };
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const exportPng = async (svg: string, height: number): Promise<void> => {
  const imageUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the profile image.');
    context.drawImage(image, 0, 0);

    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Your browser could not create the profile PNG.'));
      }, 'image/png');
    });
    downloadBlob(png, 'tea-tasting-profile.png');
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

document.querySelectorAll<HTMLInputElement>('.category-slider').forEach((slider) => {
  slider.addEventListener('input', () => {
    const output = document.querySelector<HTMLOutputElement>(`#value-${slider.dataset.categoryId}`);
    if (output) output.value = slider.value;
    renderChart();
  });
});

document.querySelectorAll<HTMLInputElement>('input[data-note-kind]').forEach((checkbox) => {
  checkbox.addEventListener('change', renderChart);
});

downloadJsonButton?.addEventListener('click', () => {
  if (!exportStatus) return;
  exportStatus.textContent = 'Preparing your tasting profile JSON…';
  const profile = getProfile();
  const json = {
    exportedAt: new Date().toISOString(),
    categories: profile.map(({ id, category, score, subcategories, tasteNotes }) => ({
      id,
      category,
      score,
      subcategories,
      tasteNotes,
    })),
  };

  downloadBlob(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }), 'tea-tasting-profile.json');
  exportStatus.textContent = 'Your tasting profile JSON has been downloaded.';
});

downloadPngButton?.addEventListener('click', async () => {
  if (!exportStatus) return;
  exportStatus.textContent = 'Preparing your tasting map image…';
  const { svg, height } = buildExportSvg(getProfile());
  try {
    await exportPng(svg, height);
    exportStatus.textContent = 'Your tasting map PNG has been downloaded.';
  } catch (error) {
    console.error('Could not export the tea tasting profile image.', error);
    exportStatus.textContent = `The profile image could not be created: ${error instanceof Error ? error.message : 'unknown error'}`;
  }
});

renderChart();
