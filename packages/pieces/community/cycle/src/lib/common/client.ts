import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export class CycleClient {
  private apiKey: string;
  private baseUrl = 'https://api.product.cycle.app/graphql';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async rawRequest(query: string, variables?: Record<string, unknown>) {
    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        query,
        variables,
      },
    });

    if (response.body.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.body.errors)}`);
    }

    return response.body;
  }

  async createFeedback(input: {
    title: string;
    assigneeEmail: string;
    customer: string;
    productId: string;
    sourceUrl: string;
    contentHTML: string;
  }) {
    const mutation = `
      mutation CreateFeedback($input: FeedbackCreateInput!) {
        createFeedback(input: $input) {
          id
          title
          content
          createdAt
          assignee {
            id
            email
          }
          product {
            id
            name
          }
        }
      }
    `;

    const variables = {
      input: {
        title: input.title,
        assignee: {
          email: input.assigneeEmail,
        },
        customer: input.customer,
        productId: input.productId,
        sourceUrl: input.sourceUrl,
        contentHTML: input.contentHTML,
      },
    };

    return this.rawRequest(mutation, variables);
  }

  async assignCountryToFeedback(docId: string, countryAttributeId: string, countryValueId: string) {
    const mutation = `
      mutation ChangeDocAttributeValue($docId: ID!, $attributeDefinitionId: ID!, $value: DocAttributeValueInput!) {
        changeDocAttributeValue(docId: $docId, attributeDefinitionId: $attributeDefinitionId, value: $value) {
          __typename
        }
      }
    `;

    const variables = {
      docId,
      attributeDefinitionId: countryAttributeId,
      value: {
        select: countryValueId,
      },
    };

    return this.rawRequest(mutation, variables);
  }
}

export function makeClient(apiKey: string): CycleClient {
  return new CycleClient(apiKey);
}
