const ssoAuth = async (request, context) => {
  let authToken = context.cookies.get("AAD_Token");
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const tokenParam = params.get("aadToken");

  if (!authToken && tokenParam) {
    authToken = tokenParam;
  }

  const authUrl = `https://azure-edge-sso.netlify.app?origin=${request.url}`;

  const isValid = async (token) => {
    const response = await fetch(`https://graph.microsoft.com/oidc/userinfo`, {
      headers: {
        Authorization: `bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.error ? false : true;
  };

  if (authToken) {
    if (await isValid(authToken)) {
      if (tokenParam) {
        const res = new Response(null, { status: 301 });
        res.headers.set("Location", `${url.origin}${url.pathname}`);
        res.headers.set("Set-Cookie", `AAD_Token=${authToken}`);
        return res;
      } else {
        return context.next();
      }
    } else {
      context.cookies.delete("AAD_Token");
      const res = new Response(null, { status: 302 });
      res.headers.set("Location", authUrl);
      return res;
    }
  } else {
    const res = new Response(null, { status: 302 });
    res.headers.set("Location", authUrl);
    return res;
  }
};

export default ssoAuth;
