import type { VercelRequest, VercelResponse } from "@vercel/node";

let cache: { token: string; expireAt: number } | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const now = Date.now();
  if (cache && cache.expireAt - now > 60_000) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(JSON.stringify({ access_token: cache.token }));
  }
  const corpid = process.env.WECOM_CORP_ID;
  const secret = process.env.WECOM_CORP_SECRET;
  const r = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${secret}`);
  const j = await r.json();
  if (j.errcode) {
    return res.status(500).send(j);
  }
  cache = { token: j.access_token, expireAt: now + (j.expires_in || 7200) * 1000 };
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify({ access_token: cache.token }));
}
