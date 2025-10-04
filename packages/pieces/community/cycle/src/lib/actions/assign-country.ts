import { createAction, Property } from '@activepieces/pieces-framework';
import { cycleAuth } from '../common/auth';
import { makeClient } from '../common/client';

export const cycleAssignCountry = createAction({
  name: 'assign_country',
  displayName: 'Assign Country to Feedback',
  description: 'Assign a country attribute to an existing feedback in Cycle',
  auth: cycleAuth,
  props: {
    feedbackId: Property.ShortText({
      displayName: 'Feedback ID',
      description: 'ID of the feedback to assign country to',
      required: true,
    }),
    country: Property.StaticDropdown({
      displayName: 'Country',
      description: 'Country to assign to the feedback',
      required: true,
      options: {
        options: [
          { label: 'France', value: 'QXR0cmlidXRlVGV4dFZhbHVlXzNiZThhMTQ3LWMyNGItNDUxNi1hZjRhLTM4NjE1ZWMyNzYzZA==' },
          { label: 'Spain', value: 'QXR0cmlidXRlVGV4dFZhbHVlXzM3ZDI1OTE0LWIwYzktNDE0ZS1hOTZhLTExYjE0NWZjOTY1Yw==' },
          { label: 'Belgium', value: 'QXR0cmlidXRlVGV4dFZhbHVlX2I3Y2Y1MWEyLTY5NTMtNGU3MC05M2E4LTI1NWM0ODI1ZDJkNQ==' },
          { label: 'Canada', value: 'QXR0cmlidXRlVGV4dFZhbHVlX2Q3YTI0ODhiLTBkZjYtNDc1YS05MDc5LWFmN2VhYTlkNzI3Mw==' },
          { label: 'Global', value: 'QXR0cmlidXRlVGV4dFZhbHVlXzFkMmE0MzZjLTM5YWItNDVlNS1hYWQ4LTkyZmUwZDJmYzk2ZA==' },
        ],
      },
    }),
    countryAttributeDefinitionId: Property.ShortText({
      displayName: 'Country Attribute Definition ID',
      description: 'The attribute definition ID for country field in Cycle',
      required: false,
      defaultValue: 'QXR0cmlidXRlU2luZ2xlU2VsZWN0RGVmaW5pdGlvbl8xYjJjMjBjZC04YmU3LTRiYjEtOTUwMC1mOGU0Y2Y0MzJkNjc=',
    }),
  },
  async run({ auth, propsValue }) {
    const client = makeClient(auth as string);
    
    const result = await client.assignCountryToFeedback(
      propsValue.feedbackId,
      propsValue.countryAttributeDefinitionId || 'QXR0cmlidXRlU2luZ2xlU2VsZWN0RGVmaW5pdGlvbl8xYjJjMjBjZC04YmU3LTRiYjEtOTUwMC1mOGU0Y2Y0MzJkNjc=',
      propsValue.country
    );

    return result;
  },
});
