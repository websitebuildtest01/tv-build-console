import { ORG, WORKFLOW, REF, SITES, json, corsHeaders, checkKey } from '../_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const cors = corsHeaders(request, env);
  if (!checkKey(request, env)) return json({ message: '访问密钥无效' }, 401, cors);
  return json({ sites: SITES, default: SITES[0].key, org: ORG, workflow: WORKFLOW, ref: REF }, 200, cors);
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request, context.env) });
}
