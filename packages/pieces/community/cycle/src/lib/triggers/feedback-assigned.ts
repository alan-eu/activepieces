import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleFeedbackAssigned = createTrigger({
  name: 'feedback_assigned',
  displayName: 'Feedback Assigned',
  description: 'Triggers when feedback is assigned to someone in Cycle',
  auth: cycleAuth,
  type: TriggerStrategy.POLLING,
  props: {
    assigneeEmail: Property.ShortText({
      displayName: 'Assignee Email',
      description: 'Only trigger for assignments to this specific email (optional)',
      required: false,
    }),
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
    updatedAt: '2024-01-01T12:30:00Z',
    assignee: {
      id: 'VXNlcl8xMjM0NTY3ODkw',
      email: 'newassignee@example.com',
      name: 'Jane Smith'
    },
    product: {
      id: 'UHJvZHVjdF8xMjM0NTY3ODkw',
      name: 'Sample Product'
    },
    customer: 'customer@example.com',
    sourceUrl: 'https://example.com/feedback',
    status: 'OPEN',
    previousAssignee: {
      id: 'VXNlcl84NzY1NDMyMQ==',
      email: 'oldassignee@example.com',
      name: 'John Doe'
    }
  },
  async onEnable(context) {
    // Store the last check time
    await context.store.put('lastAssignmentCheck', new Date().toISOString());
    // Store known feedback assignments to detect changes
    await context.store.put('feedbackAssignees', '{}');
  },
  async onDisable(context) {
    // Clean up stored data
    await context.store.delete('lastAssignmentCheck');
    await context.store.delete('feedbackAssignees');
  },
  async run(context) {
    const client = makeClient(context.auth as string);
    const lastCheck = await context.store.get('lastAssignmentCheck') as string || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const storedAssignees = JSON.parse(await context.store.get('feedbackAssignees') as string || '{}');
    
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

      const assignments = [];
      const newAssignees = { ...storedAssignees };

      for (const feedback of feedbacks) {
        const previousAssigneeId = storedAssignees[feedback.id];
        const currentAssigneeId = feedback.assignee?.id;

        // Check if this is an assignment change
        if (previousAssigneeId !== currentAssigneeId) {
          // If we have an assignee email filter, check if it matches
          if (!context.propsValue['assigneeEmail'] || 
              (feedback.assignee?.email && feedback.assignee.email === context.propsValue['assigneeEmail'])) {
            
            assignments.push({
              id: feedback.id,
              data: {
                ...feedback,
                previousAssignee: previousAssigneeId ? { id: previousAssigneeId } : null,
              },
            });
          }
        }

        // Update stored assignee
        newAssignees[feedback.id] = currentAssigneeId;
      }

      // Update stored data
      await context.store.put('lastAssignmentCheck', new Date().toISOString());
      await context.store.put('feedbackAssignees', JSON.stringify(newAssignees));

      return assignments;
    } catch (error) {
      console.error('Error fetching feedback assignments:', error);
      return [];
    }
  },
});
