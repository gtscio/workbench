// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ErrorHelper, Is } from "@twin.org/core";
import { IdentityClient } from "@twin.org/identity-rest-client";
import type { IDidDocument } from "@twin.org/standards-w3c-did";

let identityClient: IdentityClient | undefined;

/**
 * Initialise the identity.
 * @param apiUrl The API url.
 */
export async function init(apiUrl: string): Promise<void> {
	identityClient = new IdentityClient({
		endpoint: apiUrl
	});
}

/**
 * Get the document for the identity.
 * @param identity The identity to get the document for.
 * @returns The error if one occurred.
 */
export async function identityGetPublic(identity: string): Promise<
	| {
			document?: IDidDocument;
			error?: string | undefined;
	  }
	| undefined
> {
	if (Is.object(identityClient)) {
		try {
			const document = await identityClient.identityResolve(identity);

			return {
				document
			};
		} catch (err) {
			return {
				error: ErrorHelper.formatErrors(err).join("\n")
			};
		}
	}
}
