import {
  DedupeStrategy,
  Polling,
  pollingHelper,
} from '@activepieces/pieces-common';
import {
  AppConnectionValueForAuthProperty,
  createTrigger,
  StaticPropsValue,
  TriggerStrategy,
} from '@activepieces/pieces-framework';
import { kandjiAuth } from '../auth';
import { kandjiApi } from '../common/client';
import { kandjiProps } from '../common/props';
import { toFlatAuditEvent } from '../common/transform';

const props = {
  target_types: kandjiProps.auditTargetTypes,
  actions: kandjiProps.auditActions,
};

const polling: Polling<
  AppConnectionValueForAuthProperty<typeof kandjiAuth>,
  StaticPropsValue<typeof props>
> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue, lastFetchEpochMS }) => {
    const events = await kandjiApi.listAuditEvents({
      auth: auth.props,
      since: lastFetchEpochMS,
    });
    const targetTypes = propsValue.target_types ?? [];
    const actions = propsValue.actions ?? [];

    return events
      .filter(
        (event) =>
          (targetTypes.length === 0 ||
            targetTypes.includes(event.target_type ?? '')) &&
          (actions.length === 0 || actions.includes(event.action ?? ''))
      )
      .map((event) => ({
        epochMilliSeconds: Date.parse(event.occurred_at ?? ''),
        data: toFlatAuditEvent(event),
      }))
      .filter((item) => !Number.isNaN(item.epochMilliSeconds));
  },
};

export const newActivityEventTrigger = createTrigger({
  auth: kandjiAuth,
  name: 'new_activity_event',
  classification: 'READ',
  displayName: 'New Activity Event',
  description:
    'Triggers when Kandji logs an activity event: a device enrolled or deleted, a Blueprint or Library Item changed, an admin or API token created, a FileVault key read.',
  aiMetadata: {
    description:
      'Fires once per event in the Kandji audit log, the tenant-wide activity feed covering device enrollment and deletion, Blueprint and Library Item changes, directory user changes, admin and API token management, access to FileVault and recovery keys, and threat and vulnerability detections. Optionally filtered by object type and by created / updated / deleted. One run receives one event; what changed is in new_state, whose shape depends on the object type.',
  },
  props,
  sampleData: {
    id: '01JNGZW47KZKPXE1JWCFE4PHDW',
    event_type: 'blueprint.update',
    occurred_at: '2025-03-04T16:29:55.253454Z',
    action: 'update',
    actor_id: 'cf40d6e7-20cb-4da9-84a1-9ad0b7003ca5',
    actor_type: 'user',
    target_id: '449ec92a-186a-44f2-9421-d5ac6e465eb5',
    target_type: 'blueprint',
    target_component: 'library_items',
    new_state: {
      name: 'demo',
      library_items_added: [
        { id: 'c7a5871a-1683-432f-87d4-30bbd404eb85', name: 'GitHub' },
      ],
      library_items_removed: [],
    },
    metadata: {},
  },
  type: TriggerStrategy.POLLING,
  async test(context) {
    return await pollingHelper.test(polling, context);
  },
  async onEnable(context) {
    await pollingHelper.onEnable(polling, context);
  },
  async onDisable(context) {
    await pollingHelper.onDisable(polling, context);
  },
  async run(context) {
    return await pollingHelper.poll(polling, context);
  },
});
