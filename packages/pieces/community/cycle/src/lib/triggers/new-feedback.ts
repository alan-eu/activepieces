import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleNewFeedback = createTrigger({
  name: 'new_feedback',
  displayName: 'New Feedback',
  description: 'Triggers when new feedback is created in Cycle',
  auth: cycleAuth,
  type: TriggerStrategy.POLLING,
  props: {
    productId: Property.ShortText({
      displayName: 'Product ID',
      description: 'Filter by specific product (optional)',
      required: false,
    }),
  },
  sampleData: {
    id: 'RmVlZGJhY2tfMTIzNDU2Nzg5MA==',
    title: 'Sample feedback title',
    content: 'This is sample feedback content',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
    assignee: {
      id: 'VXNlcl8xMjM0NTY3ODkw',
      email: 'user@example.com',
      name: 'John Doe'
    },
    product: {
      id: 'UHJvZHVjdF8xMjM0NTY3ODkw',
      name: 'Sample Product'
    },
    customer: 'customer@example.com',
    sourceUrl: 'https://example.com/feedback',
    status: 'OPEN'
  },
  async onEnable(context) {
    await context.store.put('lastPollTime', new Date().toISOString());
  },
  async onDisable(context) {
    await context.store.delete('lastPollTime');
  },
  async run(context) {
    const client = makeClient(context.auth as string);
    const lastPollTime = await context.store.get('lastPollTime') as string || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const query = `
      query GetRecentFeedback($after: DateTime!, $productId: ID) {
        feedbacks(
          first: 50,
          orderBy: { field: CREATED_AT, direction: DESC },
          filter: { 
            createdAt: { after: $after }
            ${context.propsValue['productId'] ? ', productId: $productId' : ''}
          }
        ) {
          nodes {
            id
            title
            content
            createdAt
            updatedAt
            assignee {
              id
              email
              name
            }
            product {
              id
              name
            }
            customer
            sourceUrl
            status
          }
        }
      }
    `;

    const variables: any = {
      after: lastPollTime,
    };

    if (context.propsValue['productId']) {
      variables.productId = context.propsValue['productId'];
    }

    try {
      const response = await client.rawRequest(query, variables);
      const feedbacks = response.data?.feedbacks?.nodes || [];

      await context.store.put('lastPollTime', new Date().toISOString());

      return feedbacks.map((feedback: any) => ({
        id: feedback.id,
        data: feedback,
      }));
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  },
});
