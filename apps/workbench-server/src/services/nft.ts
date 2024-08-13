// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce, GeneralError, I18n } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import {
	EntityStorageNftConnector,
	initSchema as initSchemaNft,
	type Nft
} from "@gtsc/nft-connector-entity-storage";
import { IotaNftConnector } from "@gtsc/nft-connector-iota";
import { NftConnectorFactory, type INftConnector } from "@gtsc/nft-models";
import { NftService } from "@gtsc/nft-service";
import { ServiceFactory, type IService } from "@gtsc/services";
import { initialiseEntityStorageConnector } from "./entityStorage.js";
import { nodeLogInfo } from "./logging.js";
import type { IWorkbenchContext } from "../models/IWorkbenchContext.js";

export const NFT_SERVICE_NAME = "nft";

/**
 * Initialise the NFT service.
 * @param context The context for the node.
 * @param services The services.
 */
export function initialiseNftService(context: IWorkbenchContext, services: IService[]): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "NFT Service" }));

	const service = new NftService();
	services.push(service);
	ServiceFactory.register(NFT_SERVICE_NAME, () => service);
}

/**
 * Initialise the NFT connector factory.
 * @param context The context for the node.
 * @param services The services.
 * @throws GeneralError if the connector type is unknown.
 */
export function initialiseNftConnectorFactory(
	context: IWorkbenchContext,
	services: IService[]
): void {
	nodeLogInfo(I18n.formatMessage("workbench.configuring", { element: "NFT Connector Factory" }));

	const type = context.envVars.WORKBENCH_NFT_CONNECTOR;

	let connector: INftConnector;
	let namespace: string;

	if (type === "iota") {
		connector = new IotaNftConnector({
			vaultConnectorType: context.envVars.WORKBENCH_VAULT_CONNECTOR,
			config: {
				clientOptions: {
					nodes: [context.envVars.WORKBENCH_IOTA_NODE_URL],
					localPow: true
				},
				coinType: Coerce.number(context.envVars.WORKBENCH_IOTA_COIN_TYPE)
			}
		});
		namespace = IotaNftConnector.NAMESPACE;
	} else if (type === "entity-storage") {
		initSchemaNft();
		initialiseEntityStorageConnector(
			context,
			services,
			context.envVars.WORKBENCH_NFT_ENTITY_STORAGE_TYPE,
			nameof<Nft>()
		);
		connector = new EntityStorageNftConnector();
		namespace = EntityStorageNftConnector.NAMESPACE;
	} else {
		throw new GeneralError("Workbench", "serviceUnknownType", {
			type,
			serviceType: "nftConnector"
		});
	}

	services.push(connector);
	NftConnectorFactory.register(namespace, () => connector);
}
