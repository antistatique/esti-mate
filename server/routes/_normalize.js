export function normalizeStr(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

export function normalizeCorrections(descriptions, payload) {
  const list = Array.isArray(payload)
    ? payload
    : payload?.corrections || payload?.items || [];

  const byIndex = descriptions.map((d) => d);
  const byId = new Map(descriptions.map((d) => [d.id, d]));

  return list.map((it, i) => {
    const source = (it && it.id && byId.get(it.id)) || byIndex[i] || {};
    const id = it?.id || source.id || `row-${i + 1}`;
    const original = source.text ?? it?.original ?? '';
    let corrected = typeof it?.corrected === 'string' ? it.corrected : (it?.after || it?.fixed || original);
    if (typeof corrected !== 'string') corrected = String(corrected ?? '');

    const hasIssues = typeof it?.hasIssues === 'boolean'
      ? it.hasIssues
      : normalizeStr(original) !== normalizeStr(corrected);

    const changes = Array.isArray(it?.changes) ? it.changes : [];

    return { id, hasIssues, corrected, changes };
  });
}
