import { createAction, Property } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';
import { toFlatDevice } from '../common/transform';

export const findDevicesAction = createAction({
  auth: kandjiAuth,
  name: 'find_devices',
  classification: 'SEARCH',
  displayName: 'Find Devices',
  description:
    'Finds enrolled devices, optionally filtered by serial number, user, Blueprint, platform or asset tag.',
  audience: 'both',
  aiMetadata: {
    description:
      'Searches enrolled Kandji devices and returns one flat record per device (ids, serial, model, OS, Blueprint, assigned user, enrollment and check-in dates). Use it to resolve a serial number, asset tag or user email to a device id before any device action, or to pull a fleet inventory when no filter is given. Read-only and idempotent; filters combine with AND and serial number, device name and user email match on partial values.',
    idempotent: true,
  },
  props: {
    serial_number: Property.ShortText({
      displayName: 'Serial Number',
      description:
        "Full or partial serial number, e.g. 'FVHHFKF7Q6L4'. Partial values match every device whose serial contains the text.",
      required: false,
    }),
    user_email: Property.ShortText({
      displayName: 'User Email',
      description:
        "Email of the assigned user, e.g. 'jane.doe@example.com'. Matches on partial values.",
      required: false,
    }),
    device_name: Property.ShortText({
      displayName: 'Device Name',
      description:
        "Full or partial device name, e.g. \"Jane's MacBook Air\".",
      required: false,
    }),
    asset_tag: Property.ShortText({
      displayName: 'Asset Tag',
      required: false,
    }),
    platform: kandjiProps.platform,
    blueprint_id: kandjiProps.blueprintId({ required: false }),
    limit: Property.Number({
      displayName: 'Limit',
      description:
        'Maximum number of devices to return. Kandji returns 300 per request, so larger values are paginated automatically.',
      required: false,
      defaultValue: 300,
    }),
  },
  async run(context) {
    const {
      serial_number,
      user_email,
      device_name,
      asset_tag,
      platform,
      blueprint_id,
      limit,
    } = context.propsValue;

    const devices = await kandjiApi.listDevices({
      auth: context.auth.props,
      limit: limit ?? kandjiApi.maxPageSize,
      query: {
        serial_number,
        user_email,
        device_name,
        asset_tag,
        platform,
        blueprint_id,
        ordering: 'device_name',
      },
    });

    return devices.map(toFlatDevice);
  },
});
