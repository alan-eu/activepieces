import { Property } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi, KandjiCredentials } from './client';
import { KandjiDevice } from './types';

// /devices has no single "search everything" filter, so a typed search hits the
// name and the serial filters and merges what comes back.
async function searchDevices(
  auth: KandjiCredentials,
  search: string
): Promise<KandjiDevice[]> {
  const [byName, bySerial] = await Promise.all([
    kandjiApi.listDevices({ auth, query: { device_name: search } }),
    kandjiApi.listDevices({ auth, query: { serial_number: search } }),
  ]);
  const merged = new Map<string, KandjiDevice>();
  for (const device of [...byName, ...bySerial]) {
    merged.set(device.device_id, device);
  }
  return [...merged.values()];
}

function deviceLabel(device: KandjiDevice): string {
  const name = device.device_name ?? 'Unnamed device';
  return device.serial_number ? `${name} (${device.serial_number})` : name;
}

const deviceId = Property.Dropdown({
  displayName: 'Device',
  description:
    'The enrolled device to act on. Start typing to search by device name or serial number.',
  auth: kandjiAuth,
  required: true,
  refreshers: [],
  options: async ({ auth, searchValue }) => {
    if (!auth) {
      return {
        disabled: true,
        options: [],
        placeholder: 'Please connect your Kandji account first.',
      };
    }
    try {
      const search = typeof searchValue === 'string' ? searchValue.trim() : '';
      const devices =
        search.length > 0
          ? await searchDevices(auth.props, search)
          : await kandjiApi.listDevices({
              auth: auth.props,
              query: { ordering: 'device_name' },
            });
      if (devices.length === 0) {
        return {
          disabled: false,
          options: [],
          placeholder: 'No devices found.',
        };
      }
      return {
        disabled: false,
        options: devices.map((device) => ({
          label: deviceLabel(device),
          value: device.device_id,
        })),
      };
    } catch (e) {
      return {
        disabled: true,
        options: [],
        placeholder: 'Could not load devices. Check your connection.',
      };
    }
  },
});

const blueprintId = ({ required = true }: { required?: boolean } = {}) =>
  Property.Dropdown({
    displayName: 'Blueprint',
    description: 'The Blueprint the device is assigned to.',
    auth: kandjiAuth,
    required,
    refreshers: [],
    options: async ({ auth }) => {
      if (!auth) {
        return {
          disabled: true,
          options: [],
          placeholder: 'Please connect your Kandji account first.',
        };
      }
      try {
        const blueprints = await kandjiApi.listBlueprints({ auth: auth.props });
        if (blueprints.length === 0) {
          return {
            disabled: false,
            options: [],
            placeholder: 'No Blueprints found.',
          };
        }
        return {
          disabled: false,
          options: blueprints
            .map((blueprint) => ({
              label: blueprint.name ?? blueprint.id,
              value: blueprint.id,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        };
      } catch (e) {
        return {
          disabled: true,
          options: [],
          placeholder: 'Could not load Blueprints. Check your connection.',
        };
      }
    },
  });

const assignedUserId = Property.Dropdown({
  displayName: 'Assigned User',
  description:
    'The user to assign the device to. Users come from your directory integration (Google Workspace, Entra ID, Okta), so someone with no directory account cannot be selected.',
  auth: kandjiAuth,
  required: false,
  refreshers: [],
  options: async ({ auth }) => {
    if (!auth) {
      return {
        disabled: true,
        options: [],
        placeholder: 'Please connect your Kandji account first.',
      };
    }
    try {
      const users = await kandjiApi.listUsers(auth.props);
      if (users.length === 0) {
        return {
          disabled: false,
          options: [],
          placeholder: 'No directory users found.',
        };
      }
      return {
        disabled: false,
        options: users
          .filter((user) => !user.archived)
          .map((user) => ({
            label: user.email ? `${user.name} (${user.email})` : `${user.name}`,
            value: user.id,
          })),
      };
    } catch (e) {
      return {
        disabled: true,
        options: [],
        placeholder: 'Could not load users. Check your connection.',
      };
    }
  },
});

const platform = Property.StaticDropdown({
  displayName: 'Platform',
  description: 'Only return devices on this platform.',
  required: false,
  options: {
    options: [
      { label: 'Mac', value: 'Mac' },
      { label: 'iPhone', value: 'iPhone' },
      { label: 'iPad', value: 'iPad' },
      { label: 'Apple TV', value: 'AppleTV' },
    ],
  },
});

export const kandjiProps = {
  deviceId,
  blueprintId,
  assignedUserId,
  platform,
};
