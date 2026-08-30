import { PieceAuth, Property } from '@activepieces/pieces-framework';
import { HttpError, HttpMethod } from '@activepieces/pieces-common';
import { kandjiApi } from './common/client';

const apiTokenDescription = `
**Create an API token in Kandji (Iru Endpoint).**

1. Sign in to Kandji, click your name at the bottom of the left navigation and select **Access**.
2. Open the **API tokens** tab and click **Add Token**.
3. Give it a name, click **Create**, then copy the token — it is shown only once.
4. Click **Configure** and enable the permissions your flows need. Nothing is enabled by default: for the actions in this piece, turn on *Device list*, *Device details*, *Application list*, *Update a device*, *Lock device*, *Update inventory*, *Create note*, *Blueprint list* and *User list*. The New Activity Event trigger also needs *List audit events*.

If your tenant has no API access at all, ask your Customer Success Manager to enable it.
`;

export const kandjiAuth = PieceAuth.CustomAuth({
  displayName: 'Connection',
  required: true,
  props: {
    api_url: Property.ShortText({
      displayName: 'API URL',
      description:
        "Your organization's API URL, shown above the token list in Access → API tokens. For example 'accuhive.api.kandji.io', or 'accuhive.api.eu.kandji.io' for an EU tenant.",
      required: true,
    }),
    api_token: PieceAuth.SecretText({
      displayName: 'API Token',
      description: apiTokenDescription,
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      await kandjiApi.call({
        auth,
        method: HttpMethod.GET,
        resourceUri: '/devices',
        query: { limit: 1 },
      });
      return { valid: true };
    } catch (e) {
      const status = e instanceof HttpError ? e.response.status : undefined;
      if (status === 401) {
        return {
          valid: false,
          error: 'Invalid API token. Create a new token in Access → API tokens.',
        };
      }
      // 403 means the token authenticated but lacks the "Device list" permission,
      // which says nothing about the permissions the flow will actually use.
      if (status === 403) {
        return { valid: true };
      }
      return {
        valid: false,
        error:
          "Could not reach Kandji. Check the API URL — it should look like 'accuhive.api.kandji.io'.",
      };
    }
  },
});
