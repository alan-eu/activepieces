import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createPost } from './lib/actions/create-post';
import { sendSms } from './lib/actions/send-sms';
import { zernioAuth } from './lib/auth';
import { zernioCommon } from './lib/common';

export const zernio = createPiece({
    displayName: 'Zernio',
    description:
        'One API for social publishing and customer communication: schedule posts across platforms, run a unified inbox, and send SMS.',
    minimumSupportedRelease: '0.36.1',
    logoUrl: 'https://cdn.activepieces.com/pieces/zernio.png',
    categories: [PieceCategory.MARKETING, PieceCategory.COMMUNICATION],
    auth: zernioAuth,
    authors: ['olivier-sambourg'],
    actions: [
        createPost,
        sendSms,
        createCustomApiCallAction({
            baseUrl: () => zernioCommon.BASE_URL,
            auth: zernioAuth,
            authMapping: async (auth) => ({
                Authorization: `Bearer ${auth.secret_text}`,
            }),
        }),
    ],
    triggers: [],
});
