// Step 1 of the GitHub OAuth flow for Sveltia/Decap CMS.
// Ported from Sveltia CMS Authenticator (github.com/sveltia/sveltia-cms-auth) to a
// Vercel serverless function. The client secret is read from an environment variable
// and never reaches the browser.
const crypto = require("crypto");

function getQuery(req) {
  if (req.query) return req.query;
  try {
    return Object.fromEntries(new URL(req.url, "https://localhost").searchParams);
  } catch (e) {
    return {};
  }
}

// HTML page that reports an error back to the CMS window opener.
function errorPage({ provider = "unknown", error, errorCode }) {
  const content = { provider, error, errorCode };
  const json = JSON.stringify(content).replace(/</g, "\\u003c");
  return `<!doctype html><html><body><script>
  (() => {
    window.addEventListener('message', ({ data, origin }) => {
      if (data === 'authorizing:${provider}') {
        window.opener?.postMessage('authorization:${provider}:error:${json}', origin);
      }
    });
    window.opener?.postMessage('authorizing:${provider}', '*');
  })();
  </script></body></html>`;
}

module.exports = function handler(req, res) {
  const { provider = "github" } = getQuery(req);

  if (provider !== "github") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html;charset=UTF-8");
    res.end(
      errorPage({
        error: "Your Git backend is not supported by the authenticator.",
        errorCode: "UNSUPPORTED_BACKEND",
      })
    );
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html;charset=UTF-8");
    res.end(
      errorPage({
        provider,
        error: "OAuth app client ID or secret is not configured.",
        errorCode: "MISCONFIGURED_CLIENT",
      })
    );
    return;
  }

  // Random CSRF token, 32 hex chars (matches the callback cookie pattern).
  const csrfToken = crypto.randomBytes(16).toString("hex");
  const scope = process.env.OAUTH_SCOPE || "repo,user";

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scope,
    state: csrfToken,
  });
  const authURL = `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.statusCode = 302;
  res.setHeader(
    "Set-Cookie",
    `csrf-token=github_${csrfToken}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`
  );
  res.setHeader("Location", authURL);
  res.end();
};
