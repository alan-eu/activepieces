import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleFeedbackStatusChanged = createTrigger({
  name: 'feedback_status_changed',
  displayName: 'Feedback Status Changed',
  description: 'Triggers when feedback status is updated in Cycle',
  auth: cycleAuth,
  type: TriggerStrategy.POLLING,
  props: {
    productId: Property.ShortText({
      displayName: 'Product ID',
      description: 'Filter by specific product (optional)',
      required: false,
    }),
    statusFilter: Property.StaticDropdown({
      displayName: 'Status Filter',
      description: 'Only trigger for specific status changes (optional)',
      required: false,
      options: {
        options: [
          { label: 'Any Status', value: '' },
          { label: 'Open', value: 'OPEN' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Planned', value: 'PLANNED' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Closed', value: 'CLOSED' },
        ],
      },
    }),
  },
  sampleData: {
    id: 'RmVlZGJhY2tfMTIzNDU2Nzg5MA==',
    title: 'Sample feedback title',
    content: 'This is sample feedback content',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:30:00Z',
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
    status: 'IN_PROGRESS',
    previousStatus: 'OPEN'
  },
  async onEnable(context) {
    // Store the last check time
    await context.store.put('lastStatusCheck', new Date().toISOString());
    // Store known feedback statuses to detect changes
    await context.store.put('feedbackStatuses', '{}');
  },
  async onDisable(context) {
    // Clean up stored data
    await context.store.delete('lastStatusCheck');
    await context.store.delete('feedbackStatuses');
  },
  async run(context) {
    const client = makeClient(context.auth as string);
    const lastCheck = await context.store.get('lastStatusCheck') as string || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const storedStatuses = JSON.parse(await context.store.get('feedbackStatuses') as string || '{}');
    
    const query = `
      query GetUpdatedFeedback($after: DateTime!, $productId: ID) {
        feedbacks(
          first: 100,
          orderBy: { field: UPDATED_AT, direction: DESC },
          filter: { 
            updatedAt: { after: $after }
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
      after: lastCheck,
    };

    if (context.propsValue['productId']) {
      variables.productId = context.propsValue['productId'];
    }

    try {
      const response = await client.rawRequest(query, variables);
      const feedbacks = response.data?.feedbacks?.nodes || [];

      const statusChanges = [];
      const newStatuses = { ...storedStatuses };

      for (const feedback of feedbacks) {
        const previousStatus = storedStatuses[feedback.id];
        const currentStatus = feedback.status;

        // Check if this is a status change 
        if (previousStatus && previousStatus !== currentStatus) {
          if (!context.propsValue['statusFilter'] || context.propsValue['statusFilter'] === currentStatus) {
            statusChanges.push({
              id: feedback.id,
              data: {
                ...feedback,
                previousStatus,
              },
            });
          }
        }

        newStatuses[feedback.id] = currentStatus;
      }

      await context.store.put('lastStatusCheck', new Date().toISOString());
      await context.store.put('feedbackStatuses', JSON.stringify(newStatuses));

      return statusChanges;
    } catch (error) {
      console.error('Error fetching feedback status changes:', error);
      return [];
    }
  },
});
