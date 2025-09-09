import { createAction, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleCreateFeedback = createAction({
  name: 'create_feedback',
  displayName: 'Create Feedback',
  description: 'Create new feedback in Cycle',
  auth: cycleAuth,
  props: {
    title: Property.ShortText({
      displayName: 'Feedback Title',
      description: 'Title of the feedback',
      required: true,
    }),
    assigneeEmail: Property.ShortText({
      displayName: 'Assignee Email',
      description: 'Email of the person who created the feedback',
      required: true,
    }),
    customer: Property.ShortText({
      displayName: 'Customer Email',
      description: 'Customer email',
      required: false,
    }),
    productId: Property.ShortText({
      displayName: 'Product ID',
      description: 'Product ID for the feedback',
      required: true,
      defaultValue: 'UHJvZHVjdF82YTAxYjczZS01MWYwLTQ4NTEtYjhiZC01ZTA3NDBiOTlmMmM=',
    }),
    sourceUrl: Property.ShortText({
      displayName: 'Source URL',
      description: 'Source URL for the feedback',
      required: false,
    }),
    contentHTML: Property.LongText({
      displayName: 'Content HTML',
      description: 'HTML content of the feedback',
      required: true,
    }),

  },
  async run({ auth, propsValue }) {
    const client = makeClient(auth as string);
    
    const result = await client.createFeedback({
      title: propsValue.title,
      assigneeEmail: propsValue.assigneeEmail,
      customer: propsValue.customer || 'customer@domain.com',
      productId: propsValue.productId,
      sourceUrl: propsValue.sourceUrl || '',
      contentHTML: propsValue.contentHTML,
    });

    return result;
  },
});
