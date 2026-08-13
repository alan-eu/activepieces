import {
    AuthenticationType,
    HttpMethod,
    httpClient,
} from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { zernioAuth } from '../auth';
import { zernioCommon } from '../common';

export const createPost = createAction({
    auth: zernioAuth,
    name: 'create_post',
    displayName: 'Create Post',
    description: 'Schedule or immediately publish a post to one or more connected social accounts.',
    audience: 'both',
    aiMetadata: {
        description:
            'Publish or schedule a social media post across one or more connected accounts in Zernio. Provide the text content and pick the target accounts. Set Publish Now to post immediately, or provide a Scheduled For time to queue it. Each call creates a new post, so retries duplicate.',
        idempotent: false,
    },
    props: {
        content: Property.LongText({
            displayName: 'Content',
            description: 'The text of the post.',
            required: true,
        }),
        accounts: zernioCommon.accountsProperty,
        publishNow: Property.Checkbox({
            displayName: 'Publish Now',
            description: 'Publish immediately instead of scheduling for a later time.',
            required: false,
            defaultValue: false,
        }),
        scheduledFor: Property.DateTime({
            displayName: 'Scheduled For',
            description:
                'When to publish, in ISO 8601 format (e.g. 2026-04-17T10:30:00Z). Ignored when Publish Now is enabled.',
            required: false,
        }),
        timezone: Property.ShortText({
            displayName: 'Timezone',
            description:
                'IANA timezone for the scheduled time (e.g. America/New_York). Defaults to UTC.',
            required: false,
        }),
    },
    async run(context) {
        const { content, accounts, publishNow, scheduledFor, timezone } =
            context.propsValue;

        const response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: `${zernioCommon.BASE_URL}/posts`,
            authentication: {
                type: AuthenticationType.BEARER_TOKEN,
                token: context.auth.secret_text,
            },
            body: {
                content,
                platforms: accounts,
                ...(publishNow ? { publishNow: true } : {}),
                ...(!publishNow && scheduledFor
                    ? { scheduledFor, timezone: timezone ?? 'UTC' }
                    : {}),
            },
        });
        return response.body;
    },
});
