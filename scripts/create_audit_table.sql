-- Kshricash — integration_audit_logs table (MySQL / MariaDB)
-- Fallback DDL for DBAs when the app's DB user cannot create the table itself.
-- Matches app/models_complete.py::IntegrationAuditLog. Safe to re-run.

CREATE TABLE IF NOT EXISTS integration_audit_logs (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    uuid            VARCHAR(36)   NOT NULL,
    created_at      DATETIME      NOT NULL,
    updated_at      DATETIME      NOT NULL,
    channel         VARCHAR(20)   NOT NULL,
    action          VARCHAR(60)   NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'SUCCESS',
    provider        VARCHAR(60)   NULL,
    environment     VARCHAR(20)   NULL,
    user_id         INT           NULL,
    actor_name      VARCHAR(255)  NULL,
    actor_phone     VARCHAR(20)   NULL,
    mobile_number   VARCHAR(20)   NULL,
    reference_id    VARCHAR(120)  NULL,
    biller_id       VARCHAR(80)   NULL,
    amount          DECIMAL(15,2) NULL,
    endpoint        VARCHAR(500)  NULL,
    http_status     SMALLINT      NULL,
    response_code   VARCHAR(60)   NULL,
    response_message TEXT         NULL,
    latency_ms      INT           NULL,
    ip_address      VARCHAR(50)   NULL,
    request_data    JSON          NULL,
    response_data   JSON          NULL,
    error           TEXT          NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_intg_audit_uuid (uuid),
    KEY ix_intg_audit_channel (channel),
    KEY ix_intg_audit_action (action),
    KEY ix_intg_audit_status (status),
    KEY ix_intg_audit_provider (provider),
    KEY ix_intg_audit_environment (environment),
    KEY ix_intg_audit_user_id (user_id),
    KEY ix_intg_audit_actor_phone (actor_phone),
    KEY ix_intg_audit_mobile_number (mobile_number),
    KEY ix_intg_audit_reference_id (reference_id),
    KEY ix_intg_audit_biller_id (biller_id),
    KEY ix_intg_audit_ip_address (ip_address),
    KEY ix_intg_audit_created_at (created_at),
    KEY ix_intg_audit_channel_created (channel, created_at),
    KEY ix_intg_audit_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional FK to users (add only if the users table is InnoDB/utf8mb4 compatible):
-- ALTER TABLE integration_audit_logs
--   ADD CONSTRAINT fk_intg_audit_user
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
