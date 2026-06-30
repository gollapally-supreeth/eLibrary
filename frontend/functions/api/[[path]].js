export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Construct the target AWS URL using the incoming path and query parameters
  const targetUrl = `http://51.20.55.19:5000${url.pathname}${url.search}`;

  // Strip out internal Cloudflare host headers to prevent Error 1003 blocks
  const modifiedHeaders = new Headers(context.request.headers);
  modifiedHeaders.delete("host"); 

  const modifiedRequest = new Request(targetUrl, {
    method: context.request.method,
    headers: modifiedHeaders,
    body: context.request.body,
    redirect: "manual"
  });

  return fetch(modifiedRequest);
}
