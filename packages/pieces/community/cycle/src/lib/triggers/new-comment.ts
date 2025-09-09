import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleNewComment = createTrigger({
  name: 'new_comment',
  displayName: 'New Comment',
  description: 'Triggers when a new comment is added to feedback in Cycle',
  auth: cycleAuth,
  type: TriggerStrategy.POLLING,
  props: {
    feedbackId: Property.ShortText({
      displayName: 'Feedback ID',
      description: 'Only trigger for comments on specific feedback (optional)',
      required: false,
    }),
    productId: Property.ShortText({
      displayName: 'Product ID',
      description: 'Filter by specific product (optional)',
      required: false,
    }),
  },
  sampleData: {
    id: 'Q29tbWVudF8xMjM0NTY3ODkw',
    content: 'This is a sample comment on the feedback',
    createdAt: '2024-01-01T12:00:00Z',
    author: {
      id: 'VXNlcl8xMjM0NTY3ODkw',
      email: 'user@example.com',
      name: 'John Doe'
    },
    feedback: {
      id: 'RmVlZGJhY2tfMTIzNDU2Nzg5MA==',
      title: 'Sample feedback title',
      product: {
        id: 'UHJvZHVjdF8xMjM0NTY3ODkw',
        name: 'Sample Product'
      }
    }
  },
  async onEnable(context) {
    // Store the last check time to avoid duplicates
    await context.store.put('lastCommentCheck', new Date().toISOString());
  },
  async onDisable(context) {
    // Clean up stored data
    await context.store.delete('lastCommentCheck');
  },
  async run(context) {
    const client = makeClient(context.auth as string);
    const lastCheck = await context.store.get('lastCommentCheck') as string || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const query = `
      query GetRecentComments($after: DateTime!, $feedbackId: ID, $productId: ID) {
        comments(
          first: 50,
          orderBy: { field: CREATED_AT, direction: DESC },
          filter: { 
            createdAt: { after: $after }
            ${context.propsValue['feedbackId'] ? ', feedbackId: $feedbackId' : ''}
            ${context.propsValue['productId'] ? ', feedback: { productId: $productId }' : ''}
          }
        ) {
          nodes {
            id
            content
            createdAt
            author {
              id
              email
              name
            }
            feedback {
              id
              title
              product {
                id
                name
              }
            }
          }
        }
      }
    `;

    const variables: any = {
      after: lastCheck,
    };

    if (context.propsValue['feedbackId']) {
      variables.feedbackId = context.propsValue['feedbackId'];
    }
    
    if (context.propsValue['productId']) {
      variables.productId = context.propsValue['productId'];
    }

    try {
      const response = await client.rawRequest(query, variables);
      const comments = response.data?.comments?.nodes || [];

      // Update the last check time
      await context.store.put('lastCommentCheck', new Date().toISOString());

      return comments.map((comment: any) => ({
        id: comment.id,
        data: comment,
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },
});
