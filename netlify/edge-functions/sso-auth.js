const ssoAuth = async (request, context) => {
  const envs = Deno.env.toObject();
  // const {
  //   NEXT_PUBLIC_AZURE_AD_CLIENT_ID: tenantId,
  //   NEXT_PUBLIC_AZURE_AD_TENANT_ID: clientId,
  // } =
  console.log(envs);
  // https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/authorize?client_id=<client-id>
  // &response_type=code
  //         & redirect_uri=http%3A%2F%2Flocalhost%3A888
  // &response_mode=query
  // &scope=2ff814a6-3304-4ab8-85cb-cd0e6f879c1d%2F.default
  // &state=1234
};

export default ssoAuth;
