import { createAction, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleExploreSchema = createAction({
  name: 'explore_schema',
  displayName: 'Explore GraphQL Schema',
  description: 'Explore Cycle\'s GraphQL schema to discover available types, fields, and values',
  auth: cycleAuth,
  props: {
    queryType: Property.StaticDropdown({
      displayName: 'Query Type',
      description: 'Type of schema exploration to perform',
      required: true,
      options: {
        options: [
          { label: 'All Attribute Definitions', value: 'attributes' },
          { label: 'Schema Introspection', value: 'introspection' },
          { label: 'Feedback Fields', value: 'feedback' },
          { label: 'Custom Query', value: 'custom' },
        ],
      },
    }),
    customQuery: Property.LongText({
      displayName: 'Custom GraphQL Query',
      description: 'Custom GraphQL query to execute (only used if Query Type is "Custom Query")',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const client = makeClient(auth as string);
    
    let query = '';
    const variables = {};

    switch (propsValue.queryType) {
      case 'attributes':
        query = `
          query GetAllAttributeDefinitions {
            attributeDefinitions(first: 50) {
              nodes {
                id
                name
                description
                __typename
                ... on AttributeSingleSelectDefinition {
                  options {
                    id
                    value
                    color
                  }
                }
                ... on AttributeMultiSelectDefinition {
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
        break;

      case 'introspection':
        query = `
          query IntrospectionQuery {
            __schema {
              types {
                name
                description
                fields {
                  name
                  description
                  type {
                    name
                    kind
                  }
                }
              }
            }
          }
        `;
        break;

      case 'feedback':
        query = `
          query ExploreFeedbackSchema {
            __type(name: "Feedback") {
              name
              description
              fields {
                name
                description
                type {
                  name
                  kind
                }
              }
            }
          }
        `;
        break;

      case 'custom':
        if (!propsValue.customQuery) {
          throw new Error('Custom query is required when Query Type is "Custom Query"');
        }
        query = propsValue.customQuery;
        break;

      default:
        throw new Error('Invalid query type');
    }

    const result = await client.rawRequest(query, variables);
    return result;
  },
});
