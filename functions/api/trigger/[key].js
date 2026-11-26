import { ORG, WORKFLOW, REF, findSite, json, corsHeaders, checkKey, githubFetch } from '../../_lib.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const cors = corsHeaders(request, env);
  if (!checkKey(request, env)) return json({ message: '访问密钥无效' }, 401, cors);
  const site = findSite(params.key);
  if (!site) return json({ message: '未知站点' }, 404, cors);
  try {
    await githubFetch(`/repos/${ORG}/${site.repo}/actions/workflows/${WORKFLOW}/dispatches`, env, {
      method: 'POST',
      body: { ref: REF }
    });
    return json({ ok: true, message: '构建已触发', site: site.key, repo: site.repo, ref: REF, siteUrl: site.site }, 200, cors);
  } catch (e) {
    return json({ ok: false, message: e.message }, 500, cors);
  }
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request, context.env) });
}
