import { HttpMethod } from '@activepieces/pieces-common';
import { createAction } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';
import { toFlatApp } from '../common/transform';
import { KandjiAppsResponse } from '../common/types';

export const listDeviceAppsAction = createAction({
  auth: kandjiAuth,
  name: 'list_device_apps',
  classification: 'SEARCH',
  displayName: 'List Device Apps',
  description: 'Lists every app installed on a device, with version and path.',
  audience: 'both',
  aiMetadata: {
    description:
      'Returns one flat record per app installed on a device (name, version, bundle id, path, source, code signature). Use it to check whether a device runs a given app or version, for software audits and license reconciliation. Read-only and idempotent. Preinstalled Apple apps are not reported on iPhone and iPad, and the inventory is as fresh as the last check-in — run Update Device Inventory first if it matters.',
    idempotent: true,
  },
  props: {
    device_id: kandjiProps.deviceId,
  },
  async run(context) {
    const response = await kandjiApi.call<KandjiAppsResponse>({
      auth: context.auth.props,
      method: HttpMethod.GET,
      resourceUri: `/devices/${context.propsValue.device_id}/apps`,
    });

    return (response.apps ?? []).map(toFlatApp);
  },
});
