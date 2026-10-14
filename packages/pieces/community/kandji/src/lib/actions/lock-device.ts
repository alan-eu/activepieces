import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi, KandjiCredentials } from '../common/client';
import { kandjiProps } from '../common/props';
import { KandjiLockResponse, KandjiUnlockPinResponse } from '../common/types';

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
      'Sends the MDM Lock Device command to one device and returns the six-digit unlock PIN of a Mac once Kandji has one. Use it when a device is lost, stolen or being offboarded; the user cannot get back in without the PIN, so store it from the output. Not idempotent in effect: a Mac locked a second time gets a new PIN, which invalidates the previous one. The command only reaches the device on its next MDM check-in, and the PIN comes back null until then, on iPhone and iPad, which lock with the existing passcode, and on Apple silicon Macs before macOS 11.5, which have no lock PIN.',
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
      unlock_pin:
        response?.PIN ?? (await readUnlockPin(context.auth.props, device_id)),
    };
  },
});

// The lock response carries the PIN of a Mac, but Kandji also generates it when
// the device receives the command, and the device record is then the only place
// holding it. Neither source has one for a device that locks with its existing
// passcode, so a missing PIN is a valid outcome rather than a failure.
async function readUnlockPin(
  auth: KandjiCredentials,
  deviceId: string
): Promise<string | null> {
  try {
    const secret = await kandjiApi.call<KandjiUnlockPinResponse>({
      auth,
      method: HttpMethod.GET,
      resourceUri: `/devices/${deviceId}/secrets/unlockpin`,
    });
    return secret?.pin ?? null;
  } catch (e) {
    return null;
  }
}
