import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

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
    original: text,
    corrected,
    changes
  };
}

router.post('/', async (req, res) => {
  try {
    const { descriptions } = req.body || {};
    if (!Array.isArray(descriptions)) {
      return res.status(400).json({ error: 'descriptions must be an array' });
    }

    if (!openai) {
      // Fallback mode
      const corrections = descriptions.map(({ id, text }) => ({ id, ...localSpellcheck(text) }));
      return res.json({ mode: 'local', corrections });
    }

    // OpenAI-powered mode
    const prompts = descriptions.map(({ id, text }) => ({ id, text }));

    const system = `You correct spelling and grammar, auto-detecting language (English and French common). Return a compact JSON array where each item is:
      {"id": string, "hasIssues": boolean, "original": string, "corrected": string, "changes": [{"type":"spelling|grammar","from":string,"to":string}]}
      Only output JSON.`;

    const user = JSON.stringify({ items: prompts });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' }
    });

    let payload;
    try {
      payload = JSON.parse(completion.choices[0].message.content || '{}');
    } catch (e) {
      return res.status(502).json({ error: 'Invalid AI response' });
    }

    const corrections = Array.isArray(payload)
      ? payload
      : (payload.corrections || payload.items || []);

    return res.json({ mode: 'openai', corrections });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'spellcheck_failed' });
  }
});

export default router;
