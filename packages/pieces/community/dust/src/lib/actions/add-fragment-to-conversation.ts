import { createAction, Property } from '@activepieces/pieces-framework';
import { dustAuth, DustAuthType } from '../..';
import { createClient } from '../common';
import mime from 'mime-types';

export const addFragmentToConversation = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'addFragmentToConversation',
  displayName: 'Add fragment to conversation',
  description:
    'Create a new content fragment in a conversation. Content fragments are pieces of information that can be inserted in conversations and are passed as context to assistants to when they generate an answer.',
  auth: dustAuth,
  props: {
    conversationId: Property.ShortText({
      displayName: 'Conversation ID',
      required: true,
    }),
    fragment: Property.File({ displayName: 'Fragment', required: true }),
    fragmentName: Property.ShortText({
      displayName: 'Fragment name',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const client = createClient(auth as DustAuthType);

    const mimeType = propsValue.fragmentName
      ? mime.lookup(propsValue.fragmentName) ||
        mime.lookup(propsValue.fragment.filename)
      : mime.lookup(propsValue.fragment.filename);
    const payload = {
      content: propsValue.fragment.data.toString('utf-8'),
      title: propsValue.fragmentName || propsValue.fragment.filename,
      contentType: mimeType || 'text/plain',
      context: null,
      url: null,
    };

    const response = await client.createContentFragment(payload);

    if (response.isErr()) {
      throw new Error(`API Error: ${response.error.message}`);
    }

    return response.value;
  },
});
