import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';
import { toFlatDeviceDetails } from '../common/transform';
import { KandjiDeviceDetails } from '../common/types';

export const getDeviceDetailsAction = createAction({
  auth: kandjiAuth,
  name: 'get_device_details',
  classification: 'READ',
  displayName: 'Get Device Details',
  description:
    'Gets the full inventory record for one device: hardware, OS, network, FileVault, MDM and agent status.',
  audience: 'both',
  aiMetadata: {
    description:
      'Returns the detailed inventory record of a single device by id, flattened to one level (hardware, OS, disk, network, assigned user, FileVault, Activation Lock, MDM and agent check-in). Use it for compliance or troubleshooting questions about one known device; use Find Devices to locate a device or to read several at once. Read-only and idempotent. Fields not collected for the device platform come back null.',
    idempotent: true,
  },
  props: {
    device_id: kandjiProps.deviceId,
    raw_response: Property.Checkbox({
      displayName: 'Return Raw Response',
      description:
        "Return Kandji's full nested payload instead of the flattened record. Turn this on when you need the lists the flat record leaves out, such as installed profiles, local user accounts or every disk volume.",
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    const details = await kandjiApi.call<KandjiDeviceDetails>({
      auth: context.auth.props,
      method: HttpMethod.GET,
      resourceUri: `/devices/${context.propsValue.device_id}/details`,
    });

    return context.propsValue.raw_response
      ? details
      : toFlatDeviceDetails(details);
  },
});
