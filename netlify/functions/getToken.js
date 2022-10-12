import fetch from "node-fetch";

const createForm = (details) => {
  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");
  return formBody;
};

exports.handler = async (request, context) => {
  const {
    AZURE_AD_CLIENT_ID: clientId,
    AZURE_AD_TENANT_ID: tenantId,
    AZURE_AD_SECRET: secret,
  } = process.env;

  const { code } = request.queryStringParameters;

  console.log("it gets here in function");

  const config = {
    grant_type: "authorization_code",
    code: code,
    client_id: clientId,
    client_secret: secret,
    redirect_uri: "http://localhost:8888/",
  };
  const form = createForm(config);

  const res = await fetch(
    "https://login.microsoftonline.com/7c33e7e3cfed48239c3cee38f4235944/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: form,
    }
  );

  let data = await res.json();

  console.log("we have data", data);

  return {
    body: JSON.stringify({ access_token: data.access_token }),
    statusCode: 200,
  };
};
