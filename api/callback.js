// Step 2 of the GitHub OAuth flow for Sveltia/Decap CMS.
// GitHub redirects here with ?code&state; we verify the CSRF cookie, exchange the code
// for an access token using the server-side secret, then hand the token back to the CMS
// window via postMessage. Ported from Sveltia CMS Authenticator.

function getQuery(req) {
  if (req.query) return req.query;
  try {
    return Object.fromEntries(new URL(req.url, "https://localhost").searchParams);
  } catch (e) {
    return {};
  }
}

// HTML page that hands the result (token or error) back to the CMS window opener.
function outputHTML(res, { provider = "unknown", token, error, errorCode }) {
  const status = error ? "error" : "success";
  const content = error ? { provider, error, errorCode } : { provider, token };
  const json = JSON.stringify(content).replace(/</g, "\\u003c");
  const html = `<!doctype html><html><body><script>
  (() => {
    window.addEventListener('message', ({ data, origin }) => {
      if (data === 'authorizing:${provider}') {
        window.opener?.postMessage('authorization:${provider}:${status}:${json}', origin);
      }
    });
    window.opener?.postMessage('authorizing:${provider}', '*');
  })();
  </script></body></html>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html;charset=UTF-8");
  // Delete the CSRF cookie now that the flow is finished.
  res.setHeader(
    "Set-Cookie",
    "csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure"
  );
  res.end(html);
}

module.exports = async function handler(req, res) {
  const { code, state } = getQuery(req);

  const cookie = req.headers.cookie || "";
  const match = cookie.match(/\bcsrf-token=([a-z-]+?)_([0-9a-f]{32})\b/);
  const provider = match && match[1];
  const csrfToken = match && match[2];

  if (!provider || provider !== "github") {
    outputHTML(res, {
      error: "Your Git backend is not supported by the authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    });
    return;
  }

  if (!code || !state) {
    outputHTML(res, {
      provider,
      error: "Failed to receive an authorization code. Please try again later.",
      errorCode: "AUTH_CODE_REQUEST_FAILED",
    });
    return;
  }

  if (!csrfToken || state !== csrfToken) {
    outputHTML(res, {
      provider,
      error: "Potential CSRF attack detected. Authentication flow aborted.",
      errorCode: "CSRF_DETECTED",
    });
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    outputHTML(res, {
      provider,
      error: "OAuth app client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    });
    return;
  }

  let response;
  try {
    response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
  } catch (e) {
    response = null;
  }

  if (!response) {
    outputHTML(res, {
      provider,
      error: "Failed to request an access token. Please try again later.",
      errorCode: "TOKEN_REQUEST_FAILED",
    });
    return;
  }

  let token = "";
  let error = "";
  try {
    const data = await response.json();
    token = data.access_token;
    error = data.error;
  } catch (e) {
    outputHTML(res, {
      provider,
      error: "Server responded with malformed data. Please try again later.",
      errorCode: "MALFORMED_RESPONSE",
    });
    return;
  }

  outputHTML(res, { provider, token, error });
};
