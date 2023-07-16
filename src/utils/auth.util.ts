import { google, Auth } from "googleapis";

export const setTokensAuthGoogle = async (
  client: Auth.OAuth2Client,
  code: string
): Promise<void> => {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
};

export const getUserByAuthGoogle = async (client: Auth.OAuth2Client) => {
  const oAuth2 = google.oauth2({
    version: "v2",
    auth: client,
  });
  const { data } = await oAuth2.userinfo.get();
  return data;
};
