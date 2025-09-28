import { createAction, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleGetAttributeValues = createAction({
  name: 'get_attribute_values',
  displayName: 'Get Attribute Values',
  description: 'Discover available attribute values for a specific attribute definition (useful for finding country value IDs)',
  auth: cycleAuth,
  props: {
    attributeDefinitionId: Property.ShortText({
      displayName: 'Attribute Definition ID',
      description: 'The attribute definition ID to query (e.g., country attribute)',
      required: true,
      defaultValue: 'QXR0cmlidXRlU2luZ2xlU2VsZWN0RGVmaW5pdGlvbl8xYjJjMjBjZC04YmU3LTRiYjEtOTUwMC1mOGU0Y2Y0MzJkNjc=',
    }),
  },
  async run({ auth, propsValue }) {
    const client = makeClient(auth as string);
    
    // Query to get attribute definition and its possible values
    const query = `
      query GetAttributeDefinition($id: ID!) {
        node(id: $id) {
          ... on AttributeSingleSelectDefinition {
            id
            name
            description
            options {
              id
              value
              color
            }
          }
        }
      }
    `;

    const variables = {
      id: propsValue.attributeDefinitionId,
    };

    try {
      const result = await client.rawRequest(query, variables);
      return result;
    } catch (error) {
      // If the specific query doesn't work, try a more general approach
      const fallbackQuery = `
        query GetAttributeValues {
          attributeDefinitions {
            nodes {
              id
              name
              ... on AttributeSingleSelectDefinition {
                options {
                  id
                  value
                  color
                }
              }
            }
          }
        }
      `;
      
      const fallbackResult = await client.rawRequest(fallbackQuery);
      return {
        message: 'Specific query failed, showing all attribute definitions',
        fallbackResult,
        originalError: error,
      };
    }
  },
});
