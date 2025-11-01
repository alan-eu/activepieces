import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { cycleAuth } from '../common/auth';

export const cycleCustomApiCall = createCustomApiCallAction({
  auth: cycleAuth,
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make custom API calls to Cycle endpoints',
  baseUrl: () => 'https://api.cycle.app',
  authMapping: async (auth) => ({
    'Authorization': `Bearer ${auth}`,
    'Content-Type': 'application/json',
  }),
});
