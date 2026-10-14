import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';
import { toFlatDevice } from '../common/transform';
import { KandjiDevice } from '../common/types';

export const updateDeviceAction = createAction({
  auth: kandjiAuth,
  name: 'update_device',
  classification: 'WRITE',
  displayName: 'Update Device',
  description:
    "Updates a device's Blueprint, assigned user, asset tag or tags.",
  audience: 'both',
  aiMetadata: {
    description:
      "Updates the editable fields on a device record: assigned Blueprint, assigned user, asset tag and tags. Use it for onboarding and offboarding (reassign the user, move the device to another Blueprint) and for asset tracking; it changes the Kandji record, not the device itself, so it sends no MDM command. Idempotent — applying the same values twice is a no-op. Fields left empty keep their current value, but a non-empty Tags list replaces the device's whole tag list.",
    idempotent: true,
  },
  props: {
    device_id: kandjiProps.deviceId,
    blueprint_id: kandjiProps.blueprintId({ required: false }),
    user_id: kandjiProps.assignedUserId,
    asset_tag: Property.ShortText({
      displayName: 'Asset Tag',
      description: "Your asset tag for the device, e.g. 'IT-01040'.",
      required: false,
    }),
    tags: Property.Array({
      displayName: 'Tags',
      description:
        'Tags to set on the device. This replaces every tag currently on the device, so include the ones you want to keep. Leave empty to keep the current tags.',
      required: false,
    }),
  },
  async run(context) {
    const { device_id, blueprint_id, user_id, asset_tag, tags } =
      context.propsValue;
    const tagList = (tags ?? []).map(String).filter((tag) => tag.length > 0);

    const body: Record<string, unknown> = {};
    if (blueprint_id) {
      body['blueprint_id'] = blueprint_id;
    }
    if (user_id) {
      body['user'] = user_id;
    }
    if (asset_tag !== undefined && asset_tag !== null) {
      body['asset_tag'] = asset_tag;
    }
    if (tagList.length > 0) {
      body['tags'] = tagList;
    }
    if (Object.keys(body).length === 0) {
      throw new Error(
        'Nothing to update: set at least one of Blueprint, Assigned User, Asset Tag or Tags.'
      );
    }

    const device = await kandjiApi.call<KandjiDevice>({
      auth: context.auth.props,
      method: HttpMethod.PATCH,
      resourceUri: `/devices/${device_id}`,
      body,
    });

    return toFlatDevice(device);
  },
});
