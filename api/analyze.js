'use strict';

const ALLOW = {
  object: ["document","card","shield","wallet","lock","coin","folder","envelope","cloud","bell","kline","calculator","safe","gear","target","receipt","phone","globe"],
  geometry: ["block","soft","thin","squircle","faceted","slab","layer","cutouts"],
  detail: ["pills","chip","stripe","wave","bars","shieldmark","keyhole","peekcard","fold","slot","cutout"],
  semantic: ["rejected","approved","pending","warning","verified","locked","error","archived"],
  material: ["frosted","clay","rubber","resin","metal","paper","liquidmetal","darkglass","ceramic","acrylic","marble","neon"],
  trim: ["chrome","gold","gunmetal","siliconedge","rosegold","blacktitanium","liquidchrome","matteblack","clearcoat","mattecoat"],
  light: ["ambient","refraction","metalhl","studio","bounce","rim","prismatic","toplight","underglow"],
  pose: ["tilt15","iso45","front","threeq","lowangle","floating","overhead","side"],
  bg: ["tpn","tshadow","cream","navy","white","black","gradient","grid"],
  kw: ["minimal","clean","premium","fintech","macaron","playful","luxury","tech","elegant","futuristic","secure","vibrant"]
};

const VOCAB = [
"object: document 文档 | card 银行卡 | shield 盾牌 | wallet 钱包 | lock 挂锁 | coin 硬币 | folder 文件夹 | envelope 信封 | cloud 云 | bell 铃铛 | kline K线图 | calculator 计算器 | safe 保险箱 | gear 齿轮 | target 靶心 | receipt 票据 | phone 手机 | globe 地球",
"geometry: block 大圆角倒角实心块 | soft 圆润充气软块 | thin 极简薄板 | squircle 超椭圆轮廓 | faceted 多面切割 | slab 圆角厚板 | layer 双层叠加 | cutouts 负空间挖孔",
"detail: pills 三条内容线 | chip 芯片 | stripe 磁条 | wave 波形线 | bars 迷你K线 | shieldmark 盾形纹理 | keyhole 钥匙孔 | peekcard 露出的卡片 | fold 折角 | slot 卡槽 | cutout 圆形挖孔",
"semantic: rejected ✕拒绝 | approved ✓通过 | pending ⏱待审 | warning !警告 | verified ◉认证 | locked 锁定 | error 错误 | archived 归档",
"material: frosted 磨砂玻璃 | clay 软陶哑光 | rubber 硅胶 | resin 透明树脂 | metal 拉丝金属 | paper 哑光纸 | liquidmetal 液态金属 | darkglass 深色磨砂玻璃 | ceramic 釉面陶瓷 | acrylic 透明亚克力 | marble 抛光大理石 | neon 霓虹光效",
"trim: chrome 抛光铬 | gold 金色金属 | gunmetal 深灰金属 | siliconedge 硅胶软边 | rosegold 玫瑰金 | blacktitanium 黑钛 | liquidchrome 液态铬边 | matteblack 哑光黑边 | clearcoat 高光清漆 | mattecoat 哑光磨砂面",
"light: ambient 柔光环境光 | refraction 玻璃折射 | metalhl 金属细亮边 | studio 左上柔光棚拍 | bounce 环境反弹光 | rim 轮廓光 | prismatic 彩色折射光 | toplight 柔和顶光 | underglow 底部环境光",
"pose: tilt15 15度微倾 | iso45 等轴测45度 | front 正面前视 | threeq 3/4侧视 | lowangle 低角度仰视 | floating 轻微悬浮 | overhead 正俯视 | side 正侧面",
"bg: tpn 透明底无投影 | tshadow 透明底柔和投影 | cream 奶油浅底 | navy 深蓝渐变底 | white 纯白背景 | black 纯黑背景 | gradient 柔和渐变底 | grid 极简网格",
"kw: minimal 极简 | clean 干净 | premium 高级 | fintech 现代金融科技 | macaron 马卡龙 | playful 俏皮 | luxury 奢华 | tech 高科技 | elegant 优雅 | futuristic 未来感 | secure 可靠 | vibrant 活力"
];

const SYSTEM = `你是 3D 图标提示词解析器。用户会发来一张 3D 图标参考图，请你按下面 10 个维度分析：
①object 主体是什么 ②geometry 主体长什么结构 ③detail 主体内部有什么内容 ④semantic 如何表达业务/状态 ⑤material 使用什么材质 ⑥trim 边缘/表面怎么处理 ⑦light 怎么打光 ⑧pose 什么视角 ⑨bg 什么背景 ⑩kw 最终视觉风格。

只输出一个 JSON 对象（不要 markdown、不要解释），结构为：
{"object":{"zh":"中文短句","en":"English phrase","chips":["id"],"custom":{"zh":"中文","en":"English"}或null},"geometry":{...},"detail":{...},"semantic":{...},"material":{...},"trim":{...},"light":{...},"pose":{...},"bg":{...},"kw":{...}}

规则：
1. 每个维度 chips 只能从候选 id 中选 0 个或多个最贴切的；chips 为空时必须给出 custom（可被加入该维度的自定义项）。
2. object.en 必须是"无冠词、单数可数名词短语"，例如 wallet、vault safe、candlestick chart；若候选没有，custom.en 给这个名词，custom.zh 给中文名。
3. semantic 优先从候选挑（✕=rejected ✓=approved ⏱=pending !/circle=warning/error 等）；画面里没有角标就 chips:[] 且 custom:null。
4. zh 是给用户看的中文说明，en 是可以写进英文提示词的话（语法通顺、小写开头）。
5. 每个维度都必须返回非空的 zh 与 en，chips 必须是数组（可为空数组，不能为 null）。
6. ⑩kw 最终视觉风格：至少从候选返回 2-4 个最贴切的 chips（如 premium/clean/minimal/tech/futuristic/vibrant/macaron 等），en 再用一句英文总结整体观感，不要留空。
7. 某维度确实看不出时，chips:[]，但仍要尽量用 zh/en 描述你观察到的观感，不要整维返回空字符串。

候选词表：
${VOCAB.join('\n')}`;

function parseRows(content) {
  let t = String(content || '').trim();
  t = t.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  const i = t.indexOf('{'), j = t.lastIndexOf('}');
  if (i < 0 || j <= i) throw new Error('模型未返回 JSON');
  return JSON.parse(t.slice(i, j + 1));
}

function cleanRows(rows) {
  if (!rows || typeof rows !== 'object') throw new Error('rows 不是 JSON 对象');
  const out = {};
  for (const k of Object.keys(ALLOW)) {
    const v = rows[k] && typeof rows[k] === 'object' ? rows[k] : {};
    const chips = Array.isArray(v.chips) ? v.chips.filter(c => ALLOW[k].includes(c)) : [];
    let cust = v.custom && typeof v.custom === 'object' && v.custom.en && String(v.custom.en).trim() ? v.custom : null;
    const en = String(v.en || '').trim();
    const zh = String(v.zh || '').trim();
    if (!chips.length && !cust && en && !/(unclear|manually|无法|不确定)/i.test(en + zh)) {
      cust = { zh, en };
    }
    out[k] = { zh, en, chips, custom: cust };
  }
  return out;
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 6e6) { reject(new Error('过大')); req.destroy(); } });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
}

async function zhipu(messages, maxTokens) {
  const key = process.env.ZHIPU_API_KEY || process.env.OPENAI_API_KEY;
  const base = (process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'glm-4v-flash';
  const r = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: maxTokens })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('模型接口 HTTP ' + r.status + ': ' + JSON.stringify(j).slice(0, 300));
  const c = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!c) throw new Error('模型无返回');
  return String(c).trim();
}

function reply(res, obj) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

module.exports = async function handler(req, res) {
  try {
    const expected = process.env.ACCESS_TOKEN || '';
    const got = req.headers['x-access-token'] || '';
    if (expected && got !== expected) return reply(res, { ok: false, error: '访问口令错误' });
    const body = JSON.parse(await readBody(req) || '{}');
    const image = body.image || '';
    if (!image) throw new Error('缺少 image');
    const content = await zhipu([
      { role: 'system', content: SYSTEM },
      { role: 'user', content: [{ type: 'text', text: '请分析这张 3D 图标参考图，严格按规则只返回 JSON。' }, { type: 'image_url', image_url: { url: image } }] }
    ], 1024);
    return reply(res, { ok: true, rows: cleanRows(parseRows(content)) });
  } catch (e) {
    return reply(res, { ok: false, error: String(e && e.message || e) });
  }
};
