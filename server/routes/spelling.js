import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Very naive local fallback to allow basic testing without OpenAI
function localSpellcheck(text) {
  const rules = [
    [/\bteh\b/gi, 'the'],
    [/\brecieve\b/gi, 'receive'],
    [/\bseperat(e|ely)\b/gi, (_, g1) => `separat${g1}`],
    [/\boccured\b/gi, 'occurred'],
    // French basics
    [/\bcest\b/gi, "c'est"],
    [/\bsest\b/gi, "s'est"],
    [/\bjai\b/gi, "j'ai"],
    [/\bdaccord\b/gi, "d'accord"],
    [/\bparceque\b/gi, 'parce que'],
    [/\baujourdhui\b/gi, "aujourd'hui"],
    [/\betre\b/gi, 'être'],
    [/\bete\b/gi, 'été'],
    [/\binteret\b/gi, 'intérêt'],
    [/\binterets\b/gi, 'intérêts'],
    [/\bdeveloppement\b/gi, 'développement'],
    [/\bcompetence(s)?\b/gi, 'compétence$1'],
    [/\bca\b/g, 'ça'],
  ];
  let corrected = text;
  let changes = [];
  for (const [pattern, replacement] of rules) {
    if (pattern.test(corrected)) {
      corrected = corrected.replace(pattern, replacement);
      changes.push({ type: 'spelling', pattern: pattern.toString() });
    }
  }
  return {
    hasIssues: changes.length > 0 && corrected !== text,
    corrected,
    changes
  };
}

function normalizeCorrections(descriptions, payload) {
  const list = Array.isArray(payload)
    ? payload
    : payload?.corrections || payload?.items || [];

  const byIndex = descriptions.map((d) => d); // keep order fallback
  const byId = new Map(descriptions.map((d) => [d.id, d]));

  return list.map((it, i) => {
    const source = (it && it.id && byId.get(it.id)) || byIndex[i] || {};
    const id = it?.id || source.id || `row-${i + 1}`;
    const original = source.text ?? it?.original ?? '';
    let corrected = typeof it?.corrected === 'string' ? it.corrected : (it?.after || it?.fixed || original);
    if (typeof corrected !== 'string') corrected = String(corrected ?? '');

    // Compute hasIssues if missing or unreliable
    const hasIssues = typeof it?.hasIssues === 'boolean'
      ? it.hasIssues
      : normalizeStr(original) !== normalizeStr(corrected);

    // Best-effort pass-through of changes array if provided
    const changes = Array.isArray(it?.changes) ? it.changes : [];

    return { id, hasIssues, corrected, changes };
  });
}

function normalizeStr(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

router.post('/', async (req, res) => {
  try {
    const { descriptions } = req.body || {};
    const started = Date.now();
    if (!Array.isArray(descriptions)) {
      return res.status(400).json({ error: 'descriptions must be an array' });
    }

    if (!openai) {
      // Fallback mode
      const corrections = descriptions.map(({ id, text }) => ({ id, ...localSpellcheck(text) }));
      const took = Date.now() - started;
      console.log(`[spell] mode=local count=${descriptions.length} time=${took}ms`);
      return res.json({ mode: 'local', corrections });
    }

    // OpenAI-powered mode
    const items = descriptions.map(({ id, text }) => ({ id, text }));

    const system = [
      'You are a precise spelling/grammar corrector. Auto-detect English/French.',
      'Respond with a JSON object of the form:',
      '{"corrections": [{"id": string, "hasIssues": boolean, "corrected": string, "changes": [{"type":"spelling|grammar","from":string,"to":string}]}]}',
      'Rules:',
      '- Output ONLY JSON (no explanations).',
      '- Preserve line breaks and spacing.',
      '- Preserve lightweight formatting markers exactly as provided:',
      "  *TEXT* denotes bold and must remain wrapped in single asterisks (don't remove or convert to **).",
      "  _TEXT_ denotes italics and must remain wrapped in single underscores.",
      '- Bullet lists: preserve and prefer the em dash bullet (— ) when bullets are clearly present. Do not replace (— ) with (-) or (*).',
      '- If a list already uses (— ), keep it. If it mixes markers (e.g., -, *), you may normalize consistently to (— ) one per line, but never invent bullets in normal prose.',
      '- Do NOT mark or annotate differences in any way: do not add underscores, brackets, parentheses, or any other change markers around modified words.',
      '- Never add new *...* or _..._ wrappers to highlight changes. Keep only the wrappers that existed in the original.',
      '- If you correct words inside a formatted span, keep the same surrounding markers.',
      '- If no change is needed, set hasIssues=false and keep corrected identical to original.'
    ].join('\n');

    const user = JSON.stringify({ items });

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });
    } catch (apiErr) {
      const took = Date.now() - started;
      console.error('[spell] openai_error', apiErr?.status || '', apiErr?.message || apiErr);
      // Fallback to local so extension can still proceed
      const corrections = descriptions.map(({ id, text }) => ({ id, ...localSpellcheck(text) }));
      console.log(`[spell] mode=openai_fallback_local model=${MODEL} count=${descriptions.length} time=${took}ms`);
      return res.json({ mode: 'openai_fallback_local', corrections });
    }

    let raw;
    try {
      raw = JSON.parse(completion.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      const took = Date.now() - started;
      console.error('[spell] invalid_ai_response', e);
      const corrections = descriptions.map(({ id, text }) => ({ id, ...localSpellcheck(text) }));
      console.log(`[spell] mode=openai_fallback_local model=${MODEL} count=${descriptions.length} time=${took}ms`);
      return res.json({ mode: 'openai_fallback_local', corrections });
    }

    const corrections = normalizeCorrections(descriptions, raw);
    const took = Date.now() - started;
    const usage = completion?.usage ? ` tokens=${completion.usage.total_tokens}` : '';
    console.log(`[spell] mode=openai model=${MODEL} count=${descriptions.length} time=${took}ms${usage}`);
    return res.json({ mode: 'openai', corrections });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'spellcheck_failed' });
  }
});

export default router;
