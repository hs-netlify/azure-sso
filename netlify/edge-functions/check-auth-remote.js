const ssoAuth = async (request, context) => {
  const authToken =
    context.cookies.get("AAD_Token") || request.cookies.get("AAD_Token");

  context.cookies.set("AAD_Token", authToken);

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
      return context.next();
    } else {
      context.cookies.delete("AAD_Token");
      const res = new Response(null, { status: 302 });
      res.headers.set("Location", request.url);
      return res;
    }
  } else {
    const res = new Response(null, { status: 302 });
    res.headers.set("Location", authUrl);
    return res;
  }
};

export default ssoAuth;
