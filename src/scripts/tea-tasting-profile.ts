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
type ImportedProfile = {
  teaName?: string;
  nameColor?: string;
  text?: string;
  categories: Array<{
    id: string;
    score: number;
    subcategories: string[];
    tasteNotes: string[];
  }>;
};

const chart = document.querySelector<SVGSVGElement>('#taste-chart');
const downloadPngButton = document.querySelector<HTMLButtonElement>('#download-png');
const downloadJsonButton = document.querySelector<HTMLButtonElement>('#download-json');
const uploadJsonInput = document.querySelector<HTMLInputElement>('#upload-json');
const teaNameInput = document.querySelector<HTMLInputElement>('#tea-name');
const nameColorInput = document.querySelector<HTMLInputElement>('#tea-name-color');
const profileTextInput = document.querySelector<HTMLTextAreaElement>('#profile-text');
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

const wrapText = (text: string, maxLength: number): string[] => {
  const lines: string[] = [];
  text.split(/\s+/).filter(Boolean).forEach((word) => {
    const previousLine = lines.at(-1);
    if (!previousLine || `${previousLine} ${word}`.length > maxLength) lines.push(word);
    else lines[lines.length - 1] = `${previousLine} ${word}`;
  });
  return lines;
};

const buildExportSvg = (profile: ProfileCategory[]): string => {
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
  const teaName = teaNameInput?.value.trim() || 'Tea tasting profile';
  const nameColor = nameColorInput?.value ?? '#5c3d2e';
  const customText = profileTextInput?.value.trim() ?? '';
  const textLines = wrapText(customText, 145);
  const customTextSvg = textLines.map((line, index) =>
    `<text x="70" y="${128 + index * 23}" fill="#6a594a" font-family="Arial, sans-serif" font-size="16">${escapeXml(line)}</text>`,
  ).join('');
  const chartTop = 170 + textLines.length * 23;
  const noteStart = chartTop + 820;
  let noteTop = noteStart;
  const noteRows = profile.map((item) => {
    const noteText = [
      item.subcategories.length ? item.subcategories.join(', ') : '',
      item.tasteNotes.length ? item.tasteNotes.join(', ') : '',
    ].filter(Boolean).join(' · ') || 'No notes selected';
    const lines = wrapText(noteText, 145);
    const text = lines.map((line, lineIndex) =>
      `<text x="0" y="${27 + lineIndex * 18}" fill="#6a594a" font-family="Arial, sans-serif" font-size="14">${escapeXml(line)}</text>`,
    ).join('');
    const rowHeight = Math.max(67, lines.length * 18 + 37);
    const row = `<g transform="translate(70 ${noteTop})">
      <text x="0" y="0" fill="${item.color}" font-family="Arial, sans-serif" font-size="16" font-weight="700">${escapeXml(item.category)}</text>
      <text x="1060" y="0" fill="#795d47" font-family="Arial, sans-serif" font-size="14" text-anchor="end">${item.score} / 5</text>
      ${text}
    </g>`;
    noteTop += rowHeight;
    return row;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1748" viewBox="0 0 1240 1748">
    <defs>
      <linearGradient id="area" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c8956c" stop-opacity=".5" />
        <stop offset="100%" stop-color="#71805b" stop-opacity=".38" />
      </linearGradient>
    </defs>
    <rect width="1240" height="1748" fill="#fff" />
    <rect x="28" y="28" width="1184" height="1692" rx="8" fill="none" stroke="#e4d8c8" stroke-width="2" />
    <text x="70" y="88" fill="${escapeXml(nameColor)}" font-family="Georgia, serif" font-size="38" font-weight="700">${escapeXml(teaName)}</text>
    ${customTextSvg}
    <g transform="translate(204 ${chartTop}) scale(1.7)">
      ${grid}${axes}
      <polygon points="${pointsAttribute(dataPoints)}" fill="url(#area)" stroke="#9b6645" stroke-width="2.5" stroke-linejoin="round" />
      ${dots}${labels}
    </g>
    <line x1="70" y1="${noteStart - 20}" x2="1170" y2="${noteStart - 20}" stroke="#d8c8b3" />
    <g>${noteRows}</g>
    <text x="70" y="1688" fill="#8d7159" font-family="Arial, sans-serif" font-size="13">čajovna miska s listím · tea tasting</text>
  </svg>`;
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const exportPng = async (svg: string): Promise<void> => {
  const imageUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1748;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readStringList = (value: unknown, allowed: string[], field: string): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`The JSON contains invalid ${field}.`);
  }
  const strings: string[] = [];
  value.forEach((item: unknown) => {
    if (typeof item !== 'string' || !allowed.includes(item)) {
      throw new Error(`The JSON contains invalid ${field}.`);
    }
    strings.push(item);
  });
  return strings;
};

const parseImportedProfile = (value: unknown): ImportedProfile => {
  if (!isRecord(value) || !Array.isArray(value.categories) || value.categories.length === 0) {
    throw new Error('The JSON does not contain a tasting profile.');
  }

  const importedCategories = value.categories.map((item: unknown) => {
    if (!isRecord(item) || typeof item.id !== 'string') {
      throw new Error('The JSON contains an invalid category.');
    }
    const category = categories.find((candidate) => candidate.id === item.id);
    if (!category || typeof item.score !== 'number' || !Number.isInteger(item.score) || item.score < 0 || item.score > 5) {
      throw new Error('The JSON contains an unknown category or an invalid score.');
    }
    return {
      id: category.id,
      score: item.score,
      subcategories: readStringList(item.subcategories, category.subcategories, 'subcategory list'),
      tasteNotes: readStringList(item.tasteNotes, category.tasteNotes, 'taste note list'),
    };
  });

  if (new Set(importedCategories.map((item) => item.id)).size !== importedCategories.length) {
    throw new Error('The JSON contains duplicate categories.');
  }
  if (value.teaName !== undefined && (typeof value.teaName !== 'string' || value.teaName.length > 80)) {
    throw new Error('The tea name must be text with at most 80 characters.');
  }
  if (value.nameColor !== undefined && (typeof value.nameColor !== 'string' || !/^#[\da-f]{6}$/i.test(value.nameColor))) {
    throw new Error('The tea name color is invalid.');
  }
  if (value.text !== undefined && (typeof value.text !== 'string' || value.text.length > 400)) {
    throw new Error('Your notes must be text with at most 400 characters.');
  }

  return {
    teaName: typeof value.teaName === 'string' ? value.teaName : undefined,
    nameColor: typeof value.nameColor === 'string' ? value.nameColor : undefined,
    text: typeof value.text === 'string' ? value.text : undefined,
    categories: importedCategories,
  };
};

uploadJsonInput?.addEventListener('change', async () => {
  const file = uploadJsonInput.files?.[0];
  if (!file || !exportStatus) return;

  exportStatus.textContent = 'Loading your tasting profile…';
  try {
    const data: unknown = JSON.parse(await file.text());
    const imported = parseImportedProfile(data);
    document.querySelectorAll<HTMLInputElement>('.category-slider').forEach((slider) => {
      slider.value = String(imported.categories.find((item) => item.id === slider.dataset.categoryId)?.score ?? 0);
      const output = document.querySelector<HTMLOutputElement>(`#value-${slider.dataset.categoryId}`);
      if (output) output.value = slider.value;
    });
    document.querySelectorAll<HTMLInputElement>('input[data-note-kind]').forEach((checkbox) => {
      const category = imported.categories.find((item) => item.id === checkbox.dataset.categoryId);
      const selectedNotes = checkbox.dataset.noteKind === 'subcategory'
        ? category?.subcategories
        : category?.tasteNotes;
      checkbox.checked = selectedNotes?.includes(checkbox.value) ?? false;
    });
    if (teaNameInput) teaNameInput.value = imported.teaName ?? '';
    if (nameColorInput) nameColorInput.value = imported.nameColor ?? '#5c3d2e';
    if (profileTextInput) profileTextInput.value = imported.text ?? '';
    renderChart();
    exportStatus.textContent = 'Your tasting profile has been loaded.';
  } catch (error) {
    console.error('Could not load the tea tasting profile JSON.', error);
    exportStatus.textContent = `The profile could not be loaded: ${error instanceof Error ? error.message : 'invalid JSON file'}`;
  } finally {
    uploadJsonInput.value = '';
  }
});

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
    teaName: teaNameInput?.value.trim() ?? '',
    nameColor: nameColorInput?.value ?? '#5c3d2e',
    text: profileTextInput?.value.trim() ?? '',
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
  exportStatus.textContent = 'Preparing your A6 tasting card…';
  const svg = buildExportSvg(getProfile());
  try {
    await exportPng(svg);
    exportStatus.textContent = 'Your A6 tasting card PNG has been downloaded.';
  } catch (error) {
    console.error('Could not export the tea tasting profile image.', error);
    exportStatus.textContent = `The profile image could not be created: ${error instanceof Error ? error.message : 'unknown error'}`;
  }
});

renderChart();
