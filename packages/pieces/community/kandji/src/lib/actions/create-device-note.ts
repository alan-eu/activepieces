import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';
import { KandjiNote } from '../common/types';

export const createDeviceNoteAction = createAction({
  auth: kandjiAuth,
  name: 'create_device_note',
  classification: 'WRITE',
  displayName: 'Create Device Note',
  description: 'Adds a note to a device record in Kandji.',
  audience: 'both',
  aiMetadata: {
    description:
      'Adds a note to a device record, visible to admins on the device page in Kandji. Use it to leave an audit trail on the device itself, for example why it was locked, reassigned or sent for repair. Not idempotent: every call creates another note, so retries duplicate it.',
    idempotent: false,
  },
  props: {
    device_id: kandjiProps.deviceId,
    content: Property.LongText({
      displayName: 'Note',
      description:
        "The text of the note, e.g. 'Locked on 2026-04-17 after the offboarding ticket IT-4821.'",
      required: true,
    }),
  },
  async run(context) {
    const { device_id, content } = context.propsValue;

    const note = await kandjiApi.call<KandjiNote>({
      auth: context.auth.props,
      method: HttpMethod.POST,
      resourceUri: `/devices/${device_id}/notes`,
      body: { content },
    });

    return {
      device_id,
      note_id: note.note_id ?? null,
      content: note.content ?? null,
      author: note.author ?? null,
      created_at: note.created_at ?? null,
      updated_at: note.updated_at ?? null,
    };
  },
});
