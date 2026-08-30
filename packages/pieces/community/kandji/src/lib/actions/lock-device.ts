import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';
import { KandjiLockResponse } from '../common/types';

export const lockDeviceAction = createAction({
  auth: kandjiAuth,
  name: 'lock_device',
  classification: 'WRITE',
  displayName: 'Lock Device',
  description:
    'Sends the MDM lock command to a device, with an optional message on the lock screen.',
  audience: 'both',
  aiMetadata: {
    description:
      'Sends the MDM Lock Device command to one device and returns the six-digit unlock PIN for a Mac. Use it when a device is lost, stolen or being offboarded; it locks the device immediately and the user cannot get back in without the PIN, so store the PIN from the output. Not idempotent in effect: a Mac locked a second time gets a new PIN, which invalidates the previous one. The command reaches the device on its next MDM check-in.',
    idempotent: false,
  },
  props: {
    device_id: kandjiProps.deviceId,
    message: Property.LongText({
      displayName: 'Lock Screen Message',
      description:
        "Text shown on the lock screen, e.g. 'This Mac is locked. Contact it-support@example.com.'",
      required: false,
    }),
    phone_number: Property.ShortText({
      displayName: 'Phone Number',
      description:
        "Contact number shown next to the message, e.g. '+33123456789'. On Macs it is only displayed on Apple silicon.",
      required: false,
    }),
  },
  async run(context) {
    const { device_id, message, phone_number } = context.propsValue;

    const body: Record<string, unknown> = {};
    if (message) {
      body['Message'] = message;
    }
    if (phone_number) {
      body['PhoneNumber'] = phone_number;
    }

    const response = await kandjiApi.call<KandjiLockResponse>({
      auth: context.auth.props,
      method: HttpMethod.POST,
      resourceUri: `/devices/${device_id}/action/lock`,
      body: Object.keys(body).length > 0 ? body : undefined,
    });

    return {
      device_id,
      // Only macOS returns a PIN; iOS and iPadOS lock with the existing passcode.
      unlock_pin: response?.PIN ?? null,
    };
  },
});
