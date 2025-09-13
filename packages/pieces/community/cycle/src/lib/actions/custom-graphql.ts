import { createAction, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleCustomGraphql = createAction({
  name: 'custom_graphql',
  displayName: 'Custom GraphQL Query',
  description: 'Execute a custom GraphQL query against Cycle API',
  auth: cycleAuth,
  props: {
    query: Property.LongText({
      displayName: 'GraphQL Query',
      description: 'The GraphQL query or mutation to execute',
      required: true,
    }),
    variables: Property.Object({
      displayName: 'Variables',
      description: 'Variables for the GraphQL query (optional)',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const client = makeClient(auth as string);
    
    const result = await client.rawRequest(
      propsValue.query,
      propsValue.variables
    );

    return result;
  },
});
