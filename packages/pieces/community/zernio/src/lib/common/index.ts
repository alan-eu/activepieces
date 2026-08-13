import {
    AuthenticationType,
    HttpMethod,
    httpClient,
} from '@activepieces/pieces-common';
import { Property } from '@activepieces/pieces-framework';
import { zernioAuth } from '../auth';

const BASE_URL = 'https://zernio.com/api/v1';

async function listAccounts(apiKey: string): Promise<ZernioAccount[]> {
    const response = await httpClient.sendRequest<{ accounts?: ZernioAccount[] }>({
        method: HttpMethod.GET,
        url: `${BASE_URL}/accounts`,
        authentication: { type: AuthenticationType.BEARER_TOKEN, token: apiKey },
    });
    return response.body.accounts ?? [];
}

const accountsProperty = Property.MultiSelectDropdown({
    displayName: 'Accounts',
    description: 'The connected social accounts to publish to.',
    required: true,
    auth: zernioAuth,
    refreshers: [],
    options: async ({ auth }) => {
        if (!auth) {
            return {
                disabled: true,
                options: [],
                placeholder: 'Connect your Zernio account first',
            };
        }
        const accounts = await listAccounts(auth.secret_text);
        return {
            disabled: false,
            options: accounts.map((account) => ({
                label: `${account.platform}: ${
                    account.displayName ?? account.username ?? account._id
                }`,
                value: { platform: account.platform, accountId: account._id },
            })),
        };
    },
});

export const zernioCommon = { BASE_URL, accountsProperty };

type ZernioAccount = {
    _id: string;
    platform: string;
    username?: string;
    displayName?: string;
};
