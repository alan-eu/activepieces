import {
  KandjiApp,
  KandjiAuditEvent,
  KandjiDevice,
  KandjiDeviceDetails,
  KandjiUserRef,
} from './types';

export function toFlatDevice(device: KandjiDevice) {
  return {
    device_id: device.device_id,
    device_name: device.device_name ?? null,
    serial_number: device.serial_number ?? null,
    asset_tag: device.asset_tag ?? null,
    model: device.model ?? null,
    platform: device.platform ?? null,
    os_version: device.os_version ?? null,
    build_version: device.supplemental_build_version ?? null,
    blueprint_id: device.blueprint_id ?? null,
    blueprint_name: device.blueprint_name ?? null,
    user_id: device.user?.id ?? null,
    user_name: device.user?.name ?? null,
    user_email: device.user?.email ?? null,
    user_is_archived: device.user?.is_archived ?? null,
    mdm_enabled: device.mdm_enabled ?? null,
    agent_installed: device.agent_installed ?? null,
    agent_version: device.agent_version ?? null,
    is_missing: device.is_missing ?? null,
    is_removed: device.is_removed ?? null,
    lost_mode_status: device.lost_mode_status ?? null,
    first_enrollment: device.first_enrollment ?? null,
    last_enrollment: device.last_enrollment ?? null,
    last_check_in: device.last_check_in ?? null,
    tags: device.tags?.join(', ') ?? null,
  };
}

export function toFlatDeviceDetails(details: KandjiDeviceDetails) {
  const general = details.general ?? {};
  const hardware = details.hardware_overview ?? {};
  const network = details.network ?? {};
  const mdm = details.mdm ?? {};
  const agent = details.kandji_agent ?? {};
  const filevault = details.filevault ?? {};
  const activationLock = details.activation_lock ?? {};
  const recovery = details.recovery_information ?? {};
  const assignedUser = asUserRef(general.assigned_user);
  const bootVolume = details.volumes?.[0];
  const regularUsers = details.users?.regular_users ?? [];

  return {
    device_id: general.device_id ?? null,
    device_name: general.device_name ?? null,
    serial_number: hardware.serial_number ?? null,
    asset_tag: general.asset_tag ?? null,
    model: general.model ?? null,
    model_identifier: hardware.model_identifier ?? null,
    platform: general.platform ?? null,
    os_version: general.os_version ?? null,
    system_version: general.system_version ?? null,
    blueprint_id: general.blueprint_uuid ?? null,
    blueprint_name: general.blueprint_name ?? null,
    assigned_user_id: assignedUser?.id ?? null,
    assigned_user_name: assignedUser?.name ?? null,
    assigned_user_email: assignedUser?.email ?? null,
    last_user: general.last_user ?? null,
    local_users: regularUsers
      .map((user) => user.username)
      .filter((username): username is string => Boolean(username))
      .join(', '),
    first_enrollment: general.first_enrollment ?? null,
    last_enrollment: general.last_enrollment ?? null,
    time_since_boot: general.time_since_boot ?? null,
    mdm_enabled: toBoolean(mdm.mdm_enabled),
    mdm_supervised: toBoolean(mdm.supervised),
    mdm_last_check_in: mdm.last_check_in ?? null,
    agent_installed: toBoolean(agent.agent_installed),
    agent_version: agent.agent_version ?? null,
    agent_last_check_in: agent.last_check_in ?? null,
    filevault_enabled: filevault.filevault_enabled ?? null,
    filevault_key_escrowed: filevault.filevault_prk_escrowed ?? null,
    filevault_key_type: filevault.filevault_recoverykey_type ?? null,
    device_activation_lock_enabled:
      activationLock.device_activation_lock_enabled ?? null,
    user_activation_lock_enabled:
      activationLock.user_activation_lock_enabled ?? null,
    recovery_lock_enabled: recovery.recovery_lock_enabled ?? null,
    processor_name: hardware.processor_name ?? null,
    total_number_of_cores: hardware.total_number_of_cores ?? null,
    memory: hardware.memory ?? null,
    udid: hardware.udid ?? null,
    boot_volume_name: bootVolume?.name ?? general.boot_volume ?? null,
    boot_volume_capacity: bootVolume?.capacity ?? null,
    boot_volume_available: bootVolume?.available ?? null,
    boot_volume_percent_used: bootVolume?.percent_used ?? null,
    local_hostname: network.local_hostname ?? null,
    ip_address: network.ip_address ?? null,
    public_ip: network.public_ip ?? null,
    mac_address: network.mac_address ?? null,
    installed_profiles_count: details.installed_profiles?.length ?? null,
    tags: details.tags?.join(', ') ?? null,
  };
}

export function toFlatApp(app: KandjiApp) {
  return {
    app_id: app.app_id ?? null,
    app_name: app.app_name ?? null,
    version: app.version ?? null,
    bundle_id: app.bundle_id ?? null,
    bundle_size: app.bundle_size ?? null,
    path: app.path ?? null,
    source: app.source ?? null,
    process: app.process ?? null,
    signature: app.signature ?? null,
    creation_date: app.creation_date ?? null,
    modification_date: app.modification_date ?? null,
  };
}

function asUserRef(
  value: KandjiUserRef | string | null | undefined
): KandjiUserRef | undefined {
  return typeof value === 'object' && value !== null ? value : undefined;
}

export function toFlatAuditEvent(event: KandjiAuditEvent) {
  return {
    id: event.id,
    // Kandji names no single event type: what happened is the object plus the
    // change, so the pair is joined once here instead of in every flow.
    event_type: `${event.target_type ?? 'unknown'}.${event.action ?? 'unknown'}`,
    occurred_at: event.occurred_at ?? null,
    action: event.action ?? null,
    actor_id: event.actor_id ?? null,
    actor_type: event.actor_type ?? null,
    target_id: event.target_id ?? null,
    target_type: event.target_type ?? null,
    target_component: event.target_component ?? null,
    // Every event type carries its own shape here, so these stay nested; flat
    // keys would differ from one event to the next.
    new_state: event.new_state ?? null,
    metadata: event.metadata ?? null,
  };
}

// /devices/{id}/details reports these flags as the strings 'True' and 'False'
// where /devices returns real booleans; the flat records must agree so the same
// column keeps one type across actions.
function toBoolean(value: string | boolean | null | undefined): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string' && value.length > 0) {
    return value.toLowerCase() === 'true';
  }
  return null;
}
