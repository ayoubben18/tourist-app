import { pgTable, pgSchema, index, foreignKey, uuid, timestamp, text, inet, uniqueIndex, check, serial, integer, numeric, boolean, jsonb, unique, point, bigint, json, varchar, smallint, bigserial, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const auth = pgSchema("auth");
export const storage = pgSchema("storage");
export const aal_levelInAuth = auth.enum("aal_level", ['aal1', 'aal2', 'aal3'])
export const code_challenge_methodInAuth = auth.enum("code_challenge_method", ['s256', 'plain'])
export const factor_statusInAuth = auth.enum("factor_status", ['unverified', 'verified'])
export const factor_typeInAuth = auth.enum("factor_type", ['totp', 'webauthn', 'phone'])
export const one_time_token_typeInAuth = auth.enum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])
export const booking_status = pgEnum("booking_status", ['pending', 'confirmed', 'completed', 'cancelled'])
export const guide_status = pgEnum("guide_status", ['pending', 'approved', 'rejected'])
export const user_roles = pgEnum("user_roles", ['visitor', 'guide', 'admin'])


export const sessionsInAuth = auth.table("sessions", {
  id: uuid().notNull(),
  user_id: uuid().notNull(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
  factor_id: uuid(),
  aal: aal_levelInAuth(),
  not_after: timestamp({ withTimezone: true, mode: 'string' }),
  refreshed_at: timestamp({ mode: 'string' }),
  user_agent: text(),
  ip: inet(),
  tag: text(),
}, (table) => [
  index("sessions_not_after_idx").using("btree", table.not_after.desc().nullsFirst().op("timestamptz_ops")),
  index("sessions_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  index("user_id_created_at_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.created_at.asc().nullsLast().op("timestamptz_ops")),
  foreignKey({
    columns: [table.user_id],
    foreignColumns: [usersInAuth.id],
    name: "sessions_user_id_fkey"
  }).onDelete("cascade"),
]);

export const sso_providersInAuth = auth.table("sso_providers", {
  id: uuid().notNull(),
  resource_id: text(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
  uniqueIndex("sso_providers_resource_id_idx").using("btree", sql`lower(resource_id)`),
  check("resource_id not empty", sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`),
]);

export const sso_domainsInAuth = auth.table("sso_domains", {
  id: uuid().notNull(),
  sso_provider_id: uuid().notNull(),
  domain: text().notNull(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
  uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
  index("sso_domains_sso_provider_id_idx").using("btree", table.sso_provider_id.asc().nullsLast().op("uuid_ops")),
  foreignKey({
    columns: [table.sso_provider_id],
    foreignColumns: [sso_providersInAuth.id],
    name: "sso_domains_sso_provider_id_fkey"
  }).onDelete("cascade"),
  check("domain not empty", sql`char_length(domain) > 0`),
]);

export const mfa_amr_claimsInAuth = auth.table("mfa_amr_claims", {
  session_id: uuid().notNull(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  authentication_method: text().notNull(),
  id: uuid().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.session_id],
    foreignColumns: [sessionsInAuth.id],
    name: "mfa_amr_claims_session_id_fkey"
  }).onDelete("cascade"),
]);

export const bookings = pgTable("bookings", {
  booking_id: serial().primaryKey().notNull(),
  circuit_id: integer(),
  tourist_id: uuid(),
  guide_id: uuid(),
  booking_date: timestamp({ withTimezone: true, mode: 'string' }),
  estimated_duration: integer(),
  status: booking_status(),
  created_at: timestamp({ mode: 'string' }).defaultNow(),
  total_price: numeric({ precision: 10, scale: 2 }),
  test: text(),
});

export const circuit_comments = pgTable("circuit_comments", {
  id: serial().primaryKey().notNull(),
  circuit_id: integer(),
  user_id: uuid(),
  comment: text().notNull(),
  rating: integer(),
  created_at: timestamp({ mode: 'string' }).defaultNow(),
});

export const circuit_points = pgTable("circuit_points", {
  id: serial().primaryKey().notNull(),
  circuit_id: integer().notNull(),
  poi_id: integer().notNull(),
  sequence_order: integer().notNull(),
});

export const circuits = pgTable("circuits", {
  id: serial().primaryKey().notNull(),
  creator_id: uuid(),
  city_id: integer(),
  name: text().notNull(),
  description: text(),
  estimated_duration: integer(),
  distance: numeric({ precision: 10, scale: 2 }),
  created_at: timestamp({ mode: 'string' }).defaultNow(),
  is_public: boolean().default(true),
  rating: numeric({ precision: 3, scale: 2 }).default('0'),
  number_of_reviews: integer().default(0),
  route_steps: jsonb(),
});

export const cities = pgTable("cities", {
  id: serial().primaryKey().notNull(),
  google_place_id: text(),
  name: text().notNull(),
  country: text().notNull(),
  description: text(),
  coordinates: point(),
  image_url: text(),
}, (table) => [
  unique("cities_google_place_id_unique").on(table.google_place_id),
]);

export const favorites = pgTable("favorites", {
  id: serial().primaryKey().notNull(),
  circuit_id: integer(),
  user_id: uuid(),
  created_at: timestamp({ mode: 'string' }).defaultNow(),
});

export const bucketsInStorage = storage.table("buckets", {
  id: text().notNull(),
  name: text().notNull(),
  owner: uuid(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
  public: boolean().default(false),
  avif_autodetection: boolean().default(false),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  file_size_limit: bigint({ mode: "number" }),
  allowed_mime_types: text().array(),
  owner_id: text(),
}, (table) => [
  uniqueIndex("bname").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const objectsInStorage = storage.table("objects", {
  id: uuid().defaultRandom().notNull(),
  bucket_id: text(),
  name: text(),
  owner: uuid(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
  last_accessed_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
  metadata: jsonb(),
  path_tokens: text().array().generatedAlwaysAs(sql`string_to_array(name, '/'::text)`),
  version: text(),
  owner_id: text(),
  user_metadata: jsonb(),
}, (table) => [
  uniqueIndex("bucketid_objname").using("btree", table.bucket_id.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
  index("idx_objects_bucket_id_name").using("btree", table.bucket_id.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
  index("name_prefix_search").using("btree", table.name.asc().nullsLast().op("text_pattern_ops")),
  foreignKey({
    columns: [table.bucket_id],
    foreignColumns: [bucketsInStorage.id],
    name: "objects_bucketId_fkey"
  }),
]);

export const guide_profiles = pgTable("guide_profiles", {
  id: uuid().primaryKey().notNull(),
  verification_status: guide_status(),
  authorization_document: uuid().notNull(),
  years_of_experience: integer(),
  available_hours: json(),
  rating: numeric({ precision: 3, scale: 2 }),
  number_of_reviews: integer().default(0),
  price_per_hour: numeric({ precision: 10, scale: 2 }),
  verified_at: timestamp({ mode: 'string' }),
  country: text(),
  cities: text().array(),
});

export const guides_comments = pgTable("guides_comments", {
  id: serial().primaryKey().notNull(),
  guide_id: uuid(),
  user_id: uuid(),
  comment: text(),
  rating: integer(),
  created_at: timestamp({ mode: 'string' }).defaultNow(),
});

export const audit_log_entriesInAuth = auth.table("audit_log_entries", {
  instance_id: uuid(),
  id: uuid().notNull(),
  payload: json(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  ip_address: varchar({ length: 64 }).default('').notNull(),
}, (table) => [
  index("audit_logs_instance_id_idx").using("btree", table.instance_id.asc().nullsLast().op("uuid_ops")),
])

export const likes = pgTable("likes", {
  id: serial().primaryKey().notNull(),
  circuit_id: integer(),
  user_id: uuid(),
  created_at: timestamp({ mode: 'string' }).defaultNow(),
});

export const points_of_interest = pgTable("points_of_interest", {
  id: serial().primaryKey().notNull(),
  google_place_id: text(),
  city_id: integer(),
  name: text().notNull(),
  description: text(),
  category: text(),
  coordinates: point(),
  estimated_duration: integer(),
  opening_hours: json(),
  address: text(),
}, (table) => [
  unique("points_of_interest_google_place_id_unique").on(table.google_place_id),
]);

export const users_additional_info = pgTable("users_additional_info", {
  id: uuid().notNull(),
  bio: text(),
  avatar_url: text(),
  full_name: text(),
  role: user_roles(),
}, (table) => [
  unique("users_additional_info_id_unique").on(table.id),
]);

export const migrationsInStorage = storage.table("migrations", {
  id: integer().notNull(),
  name: varchar({ length: 100 }).notNull(),
  hash: varchar({ length: 40 }).notNull(),
  executed_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const schema_migrationsInAuth = auth.table("schema_migrations", {
  version: varchar({ length: 255 }).notNull(),
});

export const instancesInAuth = auth.table("instances", {
  id: uuid().notNull(),
  uuid: uuid(),
  raw_base_config: text(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
});

export const usersInAuth = auth.table("users", {
  instance_id: uuid(),
  id: uuid().notNull(),
  aud: varchar({ length: 255 }),
  role: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  encrypted_password: varchar({ length: 255 }),
  email_confirmed_at: timestamp({ withTimezone: true, mode: 'string' }),
  invited_at: timestamp({ withTimezone: true, mode: 'string' }),
  confirmation_token: varchar({ length: 255 }),
  confirmation_sent_at: timestamp({ withTimezone: true, mode: 'string' }),
  recovery_token: varchar({ length: 255 }),
  recovery_sent_at: timestamp({ withTimezone: true, mode: 'string' }),
  email_change_token_new: varchar({ length: 255 }),
  email_change: varchar({ length: 255 }),
  email_change_sent_at: timestamp({ withTimezone: true, mode: 'string' }),
  last_sign_in_at: timestamp({ withTimezone: true, mode: 'string' }),
  raw_app_meta_data: jsonb(),
  raw_user_meta_data: jsonb(),
  is_super_admin: boolean(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
  phone: text().default(sql`NULL`),
  phone_confirmed_at: timestamp({ withTimezone: true, mode: 'string' }),
  phone_change: text().default(''),
  phone_change_token: varchar({ length: 255 }).default(''),
  phone_change_sent_at: timestamp({ withTimezone: true, mode: 'string' }),
  confirmed_at: timestamp({ withTimezone: true, mode: 'string' }).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
  email_change_token_current: varchar({ length: 255 }).default(''),
  email_change_confirm_status: smallint().default(0),
  banned_until: timestamp({ withTimezone: true, mode: 'string' }),
  reauthentication_token: varchar({ length: 255 }).default(''),
  reauthentication_sent_at: timestamp({ withTimezone: true, mode: 'string' }),
  is_sso_user: boolean().default(false).notNull(),
  deleted_at: timestamp({ withTimezone: true, mode: 'string' }),
  is_anonymous: boolean().default(false).notNull(),
}, (table) => [
  uniqueIndex("confirmation_token_idx").using("btree", table.confirmation_token.asc().nullsLast().op("text_ops")).where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
  uniqueIndex("email_change_token_current_idx").using("btree", table.email_change_token_current.asc().nullsLast().op("text_ops")).where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
  uniqueIndex("email_change_token_new_idx").using("btree", table.email_change_token_new.asc().nullsLast().op("text_ops")).where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
  uniqueIndex("reauthentication_token_idx").using("btree", table.reauthentication_token.asc().nullsLast().op("text_ops")).where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
  uniqueIndex("recovery_token_idx").using("btree", table.recovery_token.asc().nullsLast().op("text_ops")).where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
  uniqueIndex("users_email_partial_key").using("btree", table.email.asc().nullsLast().op("text_ops")).where(sql`(is_sso_user = false)`),
  index("users_instance_id_email_idx").using("btree", sql`instance_id`, sql`lower((email)::text)`),
  index("users_instance_id_idx").using("btree", table.instance_id.asc().nullsLast().op("uuid_ops")),
  index("users_is_anonymous_idx").using("btree", table.is_anonymous.asc().nullsLast().op("bool_ops")),
  check("users_email_change_confirm_status_check", sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`),
]);

export const saml_relay_statesInAuth = auth.table("saml_relay_states", {
  id: uuid().notNull(),
  sso_provider_id: uuid().notNull(),
  request_id: text().notNull(),
  for_email: text(),
  redirect_to: text(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
  flow_state_id: uuid(),
}, (table) => [
  index("saml_relay_states_created_at_idx").using("btree", table.created_at.desc().nullsFirst().op("timestamptz_ops")),
  index("saml_relay_states_for_email_idx").using("btree", table.for_email.asc().nullsLast().op("text_ops")),
  index("saml_relay_states_sso_provider_id_idx").using("btree", table.sso_provider_id.asc().nullsLast().op("uuid_ops")),
  foreignKey({
    columns: [table.flow_state_id],
    foreignColumns: [flow_stateInAuth.id],
    name: "saml_relay_states_flow_state_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.sso_provider_id],
    foreignColumns: [sso_providersInAuth.id],
    name: "saml_relay_states_sso_provider_id_fkey"
  }).onDelete("cascade"),
  check("request_id not empty", sql`char_length(request_id) > 0`),
]);

export const refresh_tokensInAuth = auth.table("refresh_tokens", {
  instance_id: uuid(),
  id: bigserial({ mode: "bigint" }).notNull(),
  token: varchar({ length: 255 }),
  user_id: varchar({ length: 255 }),
  revoked: boolean(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
  parent: varchar({ length: 255 }),
  session_id: uuid(),
}, (table) => [
  index("refresh_tokens_instance_id_idx").using("btree", table.instance_id.asc().nullsLast().op("uuid_ops")),
  index("refresh_tokens_instance_id_user_id_idx").using("btree", table.instance_id.asc().nullsLast().op("text_ops"), table.user_id.asc().nullsLast().op("text_ops")),
  index("refresh_tokens_parent_idx").using("btree", table.parent.asc().nullsLast().op("text_ops")),
  index("refresh_tokens_session_id_revoked_idx").using("btree", table.session_id.asc().nullsLast().op("bool_ops"), table.revoked.asc().nullsLast().op("bool_ops")),
  index("refresh_tokens_updated_at_idx").using("btree", table.updated_at.desc().nullsFirst().op("timestamptz_ops")),
  foreignKey({
    columns: [table.session_id],
    foreignColumns: [sessionsInAuth.id],
    name: "refresh_tokens_session_id_fkey"
  }).onDelete("cascade"),
]);

export const saml_providersInAuth = auth.table("saml_providers", {
  id: uuid().notNull(),
  sso_provider_id: uuid().notNull(),
  entity_id: text().notNull(),
  metadata_xml: text().notNull(),
  metadata_url: text(),
  attribute_mapping: jsonb(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
  name_id_format: text(),
}, (table) => [
  index("saml_providers_sso_provider_id_idx").using("btree", table.sso_provider_id.asc().nullsLast().op("uuid_ops")),
  foreignKey({
    columns: [table.sso_provider_id],
    foreignColumns: [sso_providersInAuth.id],
    name: "saml_providers_sso_provider_id_fkey"
  }).onDelete("cascade"),
  check("entity_id not empty", sql`char_length(entity_id) > 0`),
  check("metadata_url not empty", sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`),
  check("metadata_xml not empty", sql`char_length(metadata_xml) > 0`),
]);

export const flow_stateInAuth = auth.table("flow_state", {
  id: uuid().notNull(),
  user_id: uuid(),
  auth_code: text().notNull(),
  code_challenge_method: code_challenge_methodInAuth().notNull(),
  code_challenge: text().notNull(),
  provider_type: text().notNull(),
  provider_access_token: text(),
  provider_refresh_token: text(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
  authentication_method: text().notNull(),
  auth_code_issued_at: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
  index("flow_state_created_at_idx").using("btree", table.created_at.desc().nullsFirst().op("timestamptz_ops")),
  index("idx_auth_code").using("btree", table.auth_code.asc().nullsLast().op("text_ops")),
  index("idx_user_id_auth_method").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.authentication_method.asc().nullsLast().op("uuid_ops")),
]);

export const identitiesInAuth = auth.table("identities", {
  provider_id: text().notNull(),
  user_id: uuid().notNull(),
  identity_data: jsonb().notNull(),
  provider: text().notNull(),
  last_sign_in_at: timestamp({ withTimezone: true, mode: 'string' }),
  created_at: timestamp({ withTimezone: true, mode: 'string' }),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }),
  email: text().generatedAlwaysAs(sql`lower((identity_data ->> 'email'::text))`),
  id: uuid().defaultRandom().notNull(),
}, (table) => [
  index("identities_email_idx").using("btree", table.email.asc().nullsLast().op("text_pattern_ops")),
  index("identities_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  foreignKey({
    columns: [table.user_id],
    foreignColumns: [usersInAuth.id],
    name: "identities_user_id_fkey"
  }).onDelete("cascade"),
]);

export const one_time_tokensInAuth = auth.table("one_time_tokens", {
  id: uuid().notNull(),
  user_id: uuid().notNull(),
  token_type: one_time_token_typeInAuth().notNull(),
  token_hash: text().notNull(),
  relates_to: text().notNull(),
  created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("one_time_tokens_relates_to_hash_idx").using("hash", table.relates_to.asc().nullsLast().op("text_ops")),
  index("one_time_tokens_token_hash_hash_idx").using("hash", table.token_hash.asc().nullsLast().op("text_ops")),
  uniqueIndex("one_time_tokens_user_id_token_type_key").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.token_type.asc().nullsLast().op("uuid_ops")),
  foreignKey({
    columns: [table.user_id],
    foreignColumns: [usersInAuth.id],
    name: "one_time_tokens_user_id_fkey"
  }).onDelete("cascade"),
  check("one_time_tokens_token_hash_check", sql`char_length(token_hash) > 0`),
]);

export const mfa_factorsInAuth = auth.table("mfa_factors", {
  id: uuid().notNull(),
  user_id: uuid().notNull(),
  friendly_name: text(),
  factor_type: factor_typeInAuth().notNull(),
  status: factor_statusInAuth().notNull(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  updated_at: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  secret: text(),
  phone: text(),
  last_challenged_at: timestamp({ withTimezone: true, mode: 'string' }),
  web_authn_credential: jsonb(),
  web_authn_aaguid: uuid(),
}, (table) => [
  index("factor_id_created_at_idx").using("btree", table.user_id.asc().nullsLast().op("timestamptz_ops"), table.created_at.asc().nullsLast().op("uuid_ops")),
  uniqueIndex("mfa_factors_user_friendly_name_unique").using("btree", table.friendly_name.asc().nullsLast().op("text_ops"), table.user_id.asc().nullsLast().op("uuid_ops")).where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
  index("mfa_factors_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  uniqueIndex("unique_phone_factor_per_user").using("btree", table.user_id.asc().nullsLast().op("text_ops"), table.phone.asc().nullsLast().op("text_ops")),
  foreignKey({
    columns: [table.user_id],
    foreignColumns: [usersInAuth.id],
    name: "mfa_factors_user_id_fkey"
  }).onDelete("cascade"),
]);

export const mfa_challengesInAuth = auth.table("mfa_challenges", {
  id: uuid().notNull(),
  factor_id: uuid().notNull(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  verified_at: timestamp({ withTimezone: true, mode: 'string' }),
  ip_address: inet().notNull(),
  otp_code: text(),
  web_authn_session_data: jsonb(),
}, (table) => [
  index("mfa_challenge_created_at_idx").using("btree", table.created_at.desc().nullsFirst().op("timestamptz_ops")),
  foreignKey({
    columns: [table.factor_id],
    foreignColumns: [mfa_factorsInAuth.id],
    name: "mfa_challenges_auth_factor_id_fkey"
  }).onDelete("cascade"),
]);

export const s3_multipart_uploads_partsInStorage = storage.table("s3_multipart_uploads_parts", {
  id: uuid().defaultRandom().notNull(),
  upload_id: text().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  size: bigint({ mode: "number" }).default(0).notNull(),
  part_number: integer().notNull(),
  bucket_id: text().notNull(),
  key: text().notNull(),
  etag: text().notNull(),
  owner_id: text(),
  version: text().notNull(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.bucket_id],
    foreignColumns: [bucketsInStorage.id],
    name: "s3_multipart_uploads_parts_bucket_id_fkey"
  }),
  foreignKey({
    columns: [table.upload_id],
    foreignColumns: [s3_multipart_uploadsInStorage.id],
    name: "s3_multipart_uploads_parts_upload_id_fkey"
  }).onDelete("cascade"),
]);

export const s3_multipart_uploadsInStorage = storage.table("s3_multipart_uploads", {
  id: text().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  in_progress_size: bigint({ mode: "number" }).default(0).notNull(),
  upload_signature: text().notNull(),
  bucket_id: text().notNull(),
  key: text().notNull(),
  version: text().notNull(),
  owner_id: text(),
  created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  user_metadata: jsonb(),
}, (table) => [
  index("idx_multipart_uploads_list").using("btree", table.bucket_id.asc().nullsLast().op("timestamptz_ops"), table.key.asc().nullsLast().op("text_ops"), table.created_at.asc().nullsLast().op("timestamptz_ops")),
  foreignKey({
    columns: [table.bucket_id],
    foreignColumns: [bucketsInStorage.id],
    name: "s3_multipart_uploads_bucket_id_fkey"
  }),
]);



export type Circuit = typeof circuits.$inferSelect;
export type UsersAdditionalInfo = typeof users_additional_info.$inferSelect;
export type City = typeof cities.$inferSelect;
export type PointOfInterest = typeof points_of_interest.$inferSelect;
export type GuideProfile = typeof guide_profiles.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type CircuitComments = typeof circuit_comments.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type GuidesComments = typeof guides_comments.$inferSelect;
