import { HttpMethod } from '@activepieces/pieces-common';
import { createAction } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';

export const updateDeviceInventoryAction = createAction({
  auth: kandjiAuth,
  name: 'update_device_inventory',
  classification: 'WRITE',
  displayName: 'Update Device Inventory',
  description:
    'Asks a device to check in now so Kandji refreshes its inventory data.',
  audience: 'both',
  aiMetadata: {
    description:
      'Runs the daily MDM commands on one device so Kandji collects fresh inventory (OS, apps, disk, security posture). Use it before reading device details or apps when the data must be current; it does not return the refreshed data, so read it in a following step. Safe to retry. The device only reports back once it is online and has checked in, which is not instant.',
    idempotent: true,
  },
  props: {
    device_id: kandjiProps.deviceId,
  },
  async run(context) {
    const { device_id } = context.propsValue;

    await kandjiApi.call({
      auth: context.auth.props,
      method: HttpMethod.POST,
      resourceUri: `/devices/${device_id}/action/updateinventory`,
    });

    return { device_id, inventory_update_requested: true };
  },
});
