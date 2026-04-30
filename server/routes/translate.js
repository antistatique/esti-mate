import { Router } from 'express';
import OpenAI from 'openai';
import { normalizeCorrections } from './_normalize.js';

const router = Router();

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-nano';

router.post('/', async (req, res) => {
  try {
    const { descriptions } = req.body || {};
    const started = Date.now();
    if (!Array.isArray(descriptions)) {
      return res.status(400).json({ error: 'descriptions must be an array' });
    }

    if (!openai) {
      const corrections = descriptions.map(({ id, text }) => ({
        id, hasIssues: false, corrected: text, changes: []
      }));
      const took = Date.now() - started;
      console.log(`[translate] mode=passthrough count=${descriptions.length} time=${took}ms`);
      return res.json({ mode: 'passthrough', corrections });
    }

    const items = descriptions.map(({ id, text }) => ({ id, text }));

    const system = [
      'You are a precise translator and spelling/grammar corrector. For each item, translate the text to English (en-US) AND fix any spelling/grammar issues during translation, so the output is clean, idiomatic English.',
      'Auto-detect source language. If the source is already English, still pass it through your spell/grammar corrector and produce a polished English version (do not translate it again).',
      'Respond with a JSON object of the form:',
      '{"corrections": [{"id": string, "hasIssues": boolean, "corrected": string, "changes": [{"type":"translation|spelling|grammar","from":string,"to":string}]}]}',
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
      '- If you correct or translate words inside a formatted span, keep the same surrounding markers.',
      '- Do NOT add quotes around the translation.',
      '- Use changes[].type = "translation" for words/phrases that were translated; use "spelling" or "grammar" for fixes applied to already-English fragments.',
      '- Set hasIssues=true whenever corrected !== original (covers translation, spell fix, or grammar fix).',
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
        response_format: { type: 'json_object' }
      });
    } catch (apiErr) {
      const took = Date.now() - started;
      console.error('[translate] openai_error', apiErr?.status || '', apiErr?.message || apiErr);
      const corrections = descriptions.map(({ id, text }) => ({
        id, hasIssues: false, corrected: text, changes: []
      }));
      console.log(`[translate] mode=openai_fallback_passthrough model=${MODEL} count=${descriptions.length} time=${took}ms`);
      return res.json({ mode: 'openai_fallback_passthrough', corrections });
    }

    let raw;
    try {
      raw = JSON.parse(completion.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      const took = Date.now() - started;
      console.error('[translate] invalid_ai_response', e);
      const corrections = descriptions.map(({ id, text }) => ({
        id, hasIssues: false, corrected: text, changes: []
      }));
      console.log(`[translate] mode=openai_fallback_passthrough model=${MODEL} count=${descriptions.length} time=${took}ms`);
      return res.json({ mode: 'openai_fallback_passthrough', corrections });
    }

    const corrections = normalizeCorrections(descriptions, raw);
    const took = Date.now() - started;
    const usage = completion?.usage ? ` tokens=${completion.usage.total_tokens}` : '';
    console.log(`[translate] mode=openai model=${MODEL} count=${descriptions.length} time=${took}ms${usage}`);
    return res.json({ mode: 'openai', corrections });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'translate_failed' });
  }
});

export default router;
