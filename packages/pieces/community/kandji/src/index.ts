import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece, PieceCategory } from '@activepieces/pieces-framework';
import { kandjiAuth } from './lib/auth';
import { createDeviceNoteAction } from './lib/actions/create-device-note';
import { findDevicesAction } from './lib/actions/find-devices';
import { getDeviceDetailsAction } from './lib/actions/get-device-details';
import { listDeviceAppsAction } from './lib/actions/list-device-apps';
import { lockDeviceAction } from './lib/actions/lock-device';
import { updateDeviceAction } from './lib/actions/update-device';
import { updateDeviceInventoryAction } from './lib/actions/update-device-inventory';
import { kandjiApi } from './lib/common/client';

export const kandji = createPiece({
  displayName: 'Kandji (Iru)',
  description:
    'Manage Apple devices with Kandji, now Iru Endpoint: search your fleet, read device inventory and apps, update assignments, and lock a device.',
  auth: kandjiAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/kandji.png',
  categories: [PieceCategory.PRODUCTIVITY],
  authors: ['AdamSelene'],
  actions: [
    findDevicesAction,
    getDeviceDetailsAction,
    listDeviceAppsAction,
    updateDeviceAction,
    updateDeviceInventoryAction,
    lockDeviceAction,
    createDeviceNoteAction,
    createCustomApiCallAction({
      baseUrl: (auth) =>
        auth
          ? kandjiApi.baseUrl(auth.props.api_url)
          : 'https://your-tenant.api.kandji.io/api/v1',
      auth: kandjiAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${auth.props.api_token}`,
      }),
    }),
  ],
  triggers: [],
});
