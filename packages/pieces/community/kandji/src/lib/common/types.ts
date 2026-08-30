export type KandjiUserRef = {
  id?: string | number | null;
  name?: string | null;
  email?: string | null;
  is_archived?: boolean | null;
};

export type KandjiDevice = {
  device_id: string;
  device_name?: string | null;
  serial_number?: string | null;
  asset_tag?: string | null;
  model?: string | null;
  platform?: string | null;
  os_version?: string | null;
  supplemental_build_version?: string | null;
  blueprint_id?: string | null;
  blueprint_name?: string | null;
  user?: KandjiUserRef | null;
  mdm_enabled?: boolean | null;
  agent_installed?: boolean | null;
  agent_version?: string | null;
  is_missing?: boolean | null;
  is_removed?: boolean | null;
  lost_mode_status?: string | null;
  first_enrollment?: string | null;
  last_enrollment?: string | null;
  last_check_in?: string | null;
  tags?: string[] | null;
};

// Every group is optional: /details is polymorphic and returns a different set of
// groups per platform (a Mac has volumes and filevault, an iPhone has cellular).
export type KandjiDeviceDetails = {
  general?: {
    device_id?: string | null;
    device_name?: string | null;
    model?: string | null;
    platform?: string | null;
    os_version?: string | null;
    system_version?: string | null;
    boot_volume?: string | null;
    time_since_boot?: string | null;
    last_user?: string | null;
    asset_tag?: string | null;
    blueprint_name?: string | null;
    blueprint_uuid?: string | null;
    first_enrollment?: string | null;
    last_enrollment?: string | null;
    // Empty string on devices with no assigned user, an object otherwise.
    assigned_user?: KandjiUserRef | string | null;
  };
  mdm?: {
    mdm_enabled?: string | boolean | null;
    supervised?: string | boolean | null;
    install_date?: string | null;
    last_check_in?: string | null;
  };
  activation_lock?: {
    device_activation_lock_enabled?: boolean | null;
    user_activation_lock_enabled?: boolean | null;
    activation_lock_supported?: boolean | null;
  };
  filevault?: {
    filevault_enabled?: boolean | null;
    filevault_recoverykey_type?: string | null;
    filevault_prk_escrowed?: boolean | null;
    filevault_regen_required?: boolean | null;
  };
  kandji_agent?: {
    agent_installed?: string | boolean | null;
    agent_version?: string | null;
    last_check_in?: string | null;
  };
  hardware_overview?: {
    model_name?: string | null;
    model_identifier?: string | null;
    processor_name?: string | null;
    total_number_of_cores?: string | null;
    memory?: string | null;
    udid?: string | null;
    serial_number?: string | null;
  };
  volumes?: {
    name?: string | null;
    capacity?: string | null;
    available?: string | null;
    percent_used?: string | null;
    encrypted?: string | null;
  }[];
  network?: {
    local_hostname?: string | null;
    mac_address?: string | null;
    ip_address?: string | null;
    public_ip?: string | null;
  };
  recovery_information?: {
    recovery_lock_enabled?: boolean | null;
    firmware_password_exist?: boolean | null;
  };
  users?: {
    regular_users?: { username?: string | null; admin?: string | boolean | null }[];
  };
  installed_profiles?: unknown[];
  tags?: string[] | null;
};

export type KandjiApp = {
  app_id?: string | null;
  app_name?: string | null;
  version?: string | null;
  bundle_id?: string | null;
  bundle_size?: string | null;
  path?: string | null;
  source?: string | null;
  process?: string | null;
  signature?: string | null;
  creation_date?: string | null;
  modification_date?: string | null;
};

export type KandjiAppsResponse = {
  device_id?: string | null;
  apps?: KandjiApp[] | null;
};

export type KandjiBlueprint = {
  id: string;
  name?: string | null;
  type?: string | null;
  computers_count?: number | null;
};

export type KandjiBlueprintPage = {
  count?: number;
  next?: string | null;
  results?: KandjiBlueprint[] | null;
};

export type KandjiUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  archived?: boolean | null;
  active?: boolean | null;
  department?: string | null;
  job_title?: string | null;
  device_count?: number | null;
};

export type KandjiUserPage = {
  next?: string | null;
  previous?: string | null;
  results?: KandjiUser[] | null;
};

export type KandjiNote = {
  note_id?: string | null;
  content?: string | null;
  author?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type KandjiLockResponse = {
  PIN?: string | null;
};

export type KandjiAuditEvent = {
  id: string;
  occurred_at?: string | null;
  action?: string | null;
  actor_id?: string | null;
  actor_type?: string | null;
  target_id?: string | null;
  target_type?: string | null;
  target_component?: string | null;
  // Shaped per event type, so it is passed through untouched.
  new_state?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};

export type KandjiAuditEventPage = {
  next?: string | null;
  previous?: string | null;
  results?: KandjiAuditEvent[] | null;
};
