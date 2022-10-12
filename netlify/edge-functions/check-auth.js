const ssoAuth = async (request, context) => {
  const {
    AZURE_AD_CLIENT_ID: clientId,
    AZURE_AD_TENANT_ID: tenantId,
    AZURE_AD_SECRET: secret,
  } = Deno.env.toObject();

  if (clientId && tenantId && secret) {
    const authToken = context.cookies.get("AAD_Token");
    const url = new URL(request.url);
    const path = url.pathname;
    const params = new URLSearchParams(url.search);
    const code = params.get("code");

    const redirectUri = url.origin;

    const isValid = async (token) => {
      const response = await fetch(
        `https://graph.microsoft.com/oidc/userinfo`,
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      return data.error ? false : true;
    };

    const authRedirect = () => {
      return Response.redirect(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_mode=query&scope=https://graph.microsoft.com/openid&state=1234`
      );
    };

    if (authToken) {
      if (await isValid(authToken)) {
        return context.next();
      } else {
        context.cookies.delete("AAD_Token");
        const res = new Response(null, { status: 302 });
        res.headers.set("Location", url.origin);
        return res;
      }
    } else if (path === "/.netlify/functions/getToken") {
      return context.next();
    } else if (code) {
      try {
        const { access_token } = await (
          await fetch(`${url.origin}/.netlify/functions/getToken?code=${code}`)
        ).json();
        if (access_token) {
          context.cookies.set({ name: "AAD_Token", value: access_token });
          const res = new Response(null, { status: 302 });
          res.headers.set("Location", url.origin);
          return res;
        } else {
          return authRedirect();
        }
      } catch (error) {
        console.log(error);
        return context.next();
      }
    } else {
      return authRedirect();
    }
  } else {
    return context.next();
  }
};

export default ssoAuth;
