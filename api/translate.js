'use strict';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 1e6) { reject(new Error('过大')); req.destroy(); } });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
}

async function zhipu(prompt) {
  const key = process.env.ZHIPU_API_KEY || process.env.OPENAI_API_KEY;
  const base = (process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'glm-4v-flash';
  const r = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 600 })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('模型接口 HTTP ' + r.status + ': ' + JSON.stringify(j).slice(0, 300));
  const c = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!c) throw new Error('模型无返回');
  return String(c).trim();
}

module.exports = async function handler(req, res) {
  const reply = obj => { res.statusCode = 200; res.setHeader('content-type', 'application/json; charset=utf-8'); res.end(JSON.stringify(obj)); };
  try {
    const expected = process.env.ACCESS_TOKEN || '';
    const got = req.headers['x-access-token'] || '';
    if (expected && got !== expected) return reply({ ok: false, error: '访问口令错误' });
    const body = JSON.parse(await readBody(req) || '{}');
    const text = String(body.text || '').trim();
    const to = String(body.to || 'zh').trim();
    if (!text) throw new Error('缺少 text');
    const prompt = to === 'zh'
      ? '把下面内容翻译成简体中文，只输出译文，不要解释或引号：\n' + text
      : '把下面内容翻译成地道的英文（简短、小写开头），只输出译文，不要解释或引号：\n' + text;
    return reply({ ok: true, text: await zhipu(prompt) });
  } catch (e) {
    return reply({ ok: false, error: String(e && e.message || e) });
  }
};
