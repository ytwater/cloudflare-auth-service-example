/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8788/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  AUTH_SERVICE: any;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url: URL = new URL(request.url);

    // Send all /auth routes to the auth service
    if (url.pathname.startsWith("/auth")) {
      return await env.AUTH_SERVICE.fetch(request);
    }

    if (url.pathname === "/private") {
      const authorizationHeader = request.headers.get("Authorization");
      const authorizationResponse = await env.AUTH_SERVICE.fetch(
        "http://localhost:8787/auth/me",
        { headers: { Authorization: authorizationHeader } }
      );
      const authorizedUser = await authorizationResponse.json();
      return new Response(JSON.stringify(authorizedUser));
    }

    const results: Response = await env.AUTH_SERVICE.fetch(
      "https://cloudflare-auth-service/ping"
    );
    const json: any = await results.json();
    console.log("🚀 ~ file: index.ts ~ line 38 ~ json", json);

    return new Response(JSON.stringify(url.pathname));
  },
};
