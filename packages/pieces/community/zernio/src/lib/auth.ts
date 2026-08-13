import { PieceAuth } from '@activepieces/pieces-framework';

export const zernioAuth = PieceAuth.SecretText({
    displayName: 'API Key',
    description:
        'Log in to zernio.com, open Settings > API Keys, and create a key. It starts with `sk_`.',
    required: true,
});
