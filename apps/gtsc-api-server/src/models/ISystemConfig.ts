// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The configuration for the system.
 */
export interface ISystemConfig {
	/**
	 * The partition id for the system data.
	 */
	systemPartitionId: string;

	/**
	 * The identity for the system.
	 */
	systemIdentity: string;

	/**
	 * List of addresses for the system.
	 */
	addresses?: string[];
}