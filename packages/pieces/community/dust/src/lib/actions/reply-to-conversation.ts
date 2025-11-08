import { createAction, Property } from '@activepieces/pieces-framework';
import { dustAuth, DustAuthType } from '../..';
import {
  assistantProp,
  createClient,
  getConversationContent,
  timeoutProp,
  timezoneProp,
  usernameProp,
} from '../common';

export const replyToConversation = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'replyToConversation',
  displayName: 'Reply to conversation',
  description: 'Send reply to existing conversation',
  auth: dustAuth,
  props: {
    conversationId: Property.ShortText({
      displayName: 'Conversation ID',
      required: true,
    }),
    assistant: assistantProp,
    query: Property.LongText({ displayName: 'Query', required: true }),
    username: usernameProp,
    timezone: timezoneProp,
    timeout: timeoutProp,
  },
  async run({ auth, propsValue }) {
    const client = createClient(auth as DustAuthType);

    const payload = {
      conversationId: propsValue.conversationId,
      message: {
        content: propsValue.query,
        mentions: [{ configurationId: propsValue.assistant }],
        context: {
          timezone: propsValue.timezone,
          username: propsValue.username,
          email: null,
          fullName: null,
          profilePictureUrl: null,
        },
      },
    };

    const response = await client.postUserMessage(payload);

    if (response.isErr()) {
      throw new Error(`API Error: ${response.error.message}`);
    }

    return await getConversationContent(
      propsValue.conversationId,
      propsValue.timeout,
      auth as DustAuthType
    );
  },
});
