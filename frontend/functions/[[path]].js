export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Rewrite the destination URL to point directly to your AWS EC2 instance
  const targetUrl = `http://51.20.55.19:5000${url.pathname}${url.search}`;
  
  // Clone the request and fetch from your AWS backend
  const modifiedRequest = new Request(targetUrl, context.request);
  return fetch(modifiedRequest);
}
