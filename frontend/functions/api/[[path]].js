export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = `http://51.20.55.19:5000${url.pathname}${url.search}`;
  
  const modifiedHeaders = new Headers(context.request.headers);
  modifiedHeaders.delete("host"); 

  // Safely extract the body text if it's a POST/PUT request
  let bodyContent = null;
  if (["POST", "PUT", "PATCH"].includes(context.request.method)) {
    bodyContent = await context.request.text();
  }

  const modifiedRequest = new Request(targetUrl, {
    method: context.request.method,
    headers: modifiedHeaders,
    body: bodyContent,
    redirect: "manual"
  });

  return fetch(modifiedRequest);
}
