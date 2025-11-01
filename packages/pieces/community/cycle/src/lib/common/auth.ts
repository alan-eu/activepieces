import { PieceAuth } from '@activepieces/pieces-framework';

const markdown = `
To obtain your API key, follow these steps:

1. Go to your Cycle workspace settings
2. Navigate to API section
3. Generate a new API key
4. Copy the API key to use here
`;

export const cycleAuth = PieceAuth.SecretText({
  displayName: 'Cycle API Key',
  required: true,
  description: markdown,
});
