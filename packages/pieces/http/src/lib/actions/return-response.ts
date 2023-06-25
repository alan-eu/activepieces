import { Property, createAction } from '@activepieces/pieces-framework';
import { StatusCodes } from 'http-status-codes';

export const httpReturnResponse = createAction({
  action: {
    name: 'return_response',
    displayName: 'Return Response',
    description: 'return a response',
    props: {
      status: Property.Number({
        displayName: 'Status',
        required: false,
        defaultValue: 200,
      }),
      headers: Property.Object({
        displayName: 'Headers',
        required: false,
      }),
      body: Property.Json({
        displayName: 'Response',
        required: true,
      }),
    },

    async run(context) {
      context.run.stop({
        response: {
          status: context.propsValue.status ?? StatusCodes.OK,
          body: context.propsValue.body,
          headers: context.propsValue.headers as Record<string, string> ?? {},
        }
      })
    },
  }
});
