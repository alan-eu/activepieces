import {
    AuthenticationType,
    HttpMethod,
    httpClient,
} from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { zernioAuth } from '../auth';
import { zernioCommon } from '../common';

export const sendSms = createAction({
    auth: zernioAuth,
    name: 'send_sms',
    displayName: 'Send SMS',
    description: 'Send an SMS text message from one of your Zernio phone numbers.',
    audience: 'both',
    aiMetadata: {
        description:
            'Send an SMS message via Zernio. Provide the sender number (one of your SMS-enabled Zernio numbers), the recipient number, and the message text. Each call sends a new message, so retries send duplicates.',
        idempotent: false,
    },
    props: {
        from: Property.ShortText({
            displayName: 'From',
            description:
                'One of your SMS-enabled Zernio numbers, in E.164 format (e.g. +14155550123).',
            required: true,
        }),
        to: Property.ShortText({
            displayName: 'To',
            description: 'Recipient phone number in E.164 format (e.g. +14155550199).',
            required: true,
        }),
        text: Property.LongText({
            displayName: 'Message',
            description: 'The text content of the SMS.',
            required: true,
        }),
    },
    async run(context) {
        const { from, to, text } = context.propsValue;

        const response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: `${zernioCommon.BASE_URL}/sms/messages`,
            authentication: {
                type: AuthenticationType.BEARER_TOKEN,
                token: context.auth.secret_text,
            },
            body: { from, to, text },
        });
        return response.body;
    },
});
