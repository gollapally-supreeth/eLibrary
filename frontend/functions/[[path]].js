export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Construct the exact destination URL for your AWS backend
  const targetUrl = `http://51.20.55.19:5000${url.pathname}${url.search}`;
  
  // Create a new request object to strip out Cloudflare-specific internal security headers 
  // that cause Error 1003 direct-access blocks.
  const modifiedHeaders = new Headers(context.request.headers);
  modifiedHeaders.delete("host"); // Let the destination set its own host header
  
  const modifiedRequest = new Request(targetUrl, {
    method: context.request.method,
    headers: modifiedHeaders,
    body: context.request.body,
    redirect: "manual"
  });

  return fetch(modifiedRequest);
}
