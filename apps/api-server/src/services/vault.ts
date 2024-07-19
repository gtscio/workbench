// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IService } from "@gtsc/services";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret,
	initSchema
} from "@gtsc/vault-connector-entity-storage";
import { type IVaultConnector, VaultConnectorFactory } from "@gtsc/vault-models";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import type { EntityStorageTypes } from "../models/entityStorage/entityStorageTypes.js";
import { logInfo } from "../progress.js";

/**
 * Initialise the vault connector factory.
 * @param envVars The environment variables.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseVaultConnectorFactory(
	envVars: { [id: string]: string },
	services: IService[]
): void {
	logInfo(I18n.formatMessage("apiServer.configuring", { element: "Vault Connector Factory" }));

	const type = envVars.GTSC_VAULT_CONNECTOR;

	let connector: IVaultConnector;
	if (type === "entity-storage") {
		initSchema();
		initialiseEntityStorageConnector(envVars, services, {
			type: envVars.GTSC_VAULT_CONNECTOR_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<VaultKey>(),
			storageName: "vault-key",
			config: Coerce.object(envVars.GTSC_VAULT_CONNECTOR_ENTITY_STORAGE_OPTIONS)
		});
		initialiseEntityStorageConnector(envVars, services, {
			type: envVars.GTSC_VAULT_CONNECTOR_ENTITY_STORAGE_TYPE as EntityStorageTypes,
			schema: nameof<VaultSecret>(),
			storageName: "vault-secret",
			config: Coerce.object(envVars.GTSC_VAULT_CONNECTOR_ENTITY_STORAGE_OPTIONS)
		});
		connector = new EntityStorageVaultConnector();
	} else {
		throw new GeneralError("apiServer", "serviceUnknownType", {
			type,
			serviceType: "vaultConnector"
		});
	}

	services.push(connector);
	VaultConnectorFactory.register("vault", () => connector);
}
