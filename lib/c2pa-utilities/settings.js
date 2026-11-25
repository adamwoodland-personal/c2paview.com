/**
 * Copyright 2026 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */
import { merge } from "../ts-deepmerge.js";
import { DEFAULT_INITIAL_RETRY_DELAY_MS, DEFAULT_MAX_RETRIES, DEFAULT_MAX_RETRY_AFTER_MS, DEFAULT_MAX_RETRY_DELAY_MS, DEFAULT_MAX_RESPONSE_BYTES, fetchWithRetry, fetchWithRetryRaw, validateFetchWithRetryOptions } from './fetchWithRetry.js';
import { snakeCaseify } from './caseConversion.js';
// =================================
// Defaults
// =================================
/**
 * This package's default settings, applied by {@link withDefaultSettings} and
 * {@link resolveSettings} so a `Reader`/`Builder` gets sane behavior even with no settings
 * provided at all.
 */
export const DEFAULT_SETTINGS = Object.freeze({
    builder: Object.freeze({
        generateC2paArchive: true
    })
});
/**
 * Merges `settings` on top of this package's default settings.
 * Useful for bindings that need this package's defaults applied without going through
 * {@link resolveSettings}'s async trust-anchor URL resolution.
 *
 * @param settings Settings to apply the defaults to.
 * @returns `settings` merged on top of this package's defaults.
 */
export function withDefaultSettings(settings) {
    return merge(DEFAULT_SETTINGS, settings ?? {});
}
// =================================
// Top-level pipeline
// =================================
/**
 * Resolves settings by resolving any embedded trust-anchor URLs, then serializing the result for
 * consumption by the core native SDK. `settings` is merged on top of this package's default
 * settings (see {@link withDefaultSettings}). To combine more than one `Settings` source, merge them with
 * {@link mergeSettings} first and pass the single result in here.
 *
 * Concurrent trust-resource requests using the global fetch and the same policy are shared.
 * Custom fetch implementations are isolated because their request context may be mutable.
 * Each trust-resource fetch has a 30-second deadline covering retries and body consumption;
 * a timeout aborts the request, rejects all waiting resolutions, and permits a later retry.
 * Completed responses are not cached.
 *
 * @param settings Settings to resolve.
 * @param options Optional configurations for fetch-with-retry.
 * @returns A JSON-serialized string containing all resolved settings values, ready to be consumed
 * by the core native SDK.
 */
export async function resolveSettings(settings, options) {
    const finalSettings = withDefaultSettings(settings);
    const resolvePromises = [];
    if (finalSettings.trust) {
        resolvePromises.push(resolveTrustSettings(finalSettings.trust, options));
    }
    if (finalSettings.tsaTrust) {
        Object.assign(finalSettings, createTsaTrustSettings(finalSettings.tsaTrust));
        resolvePromises.push(resolveTrustSettings(finalSettings.tsaTrust, options));
    }
    if (finalSettings.cawgTrust) {
        resolvePromises.push(resolveTrustSettings(finalSettings.cawgTrust, options));
    }
    // Wait for all trust list resolutions to complete.
    await Promise.all(resolvePromises);
    return JSON.stringify(snakeCaseify(toWireSettings(finalSettings)));
}
/**
 * `c2pa-rs` 0.91 replaced the separate top-level `cawg_trust` settings section (and the flat,
 * now-deprecated `trust_anchors`/`user_anchors` string fields) with a single `trust.anchors[]`
 * list, where each entry is tagged with a `trustKind` identifying which certificate chain it
 * applies to. This builds that shape directly from our own `trust`/`tsaTrust`/`cawgTrust`
 * sections rather than relying on the deprecated fields, which are slated for removal in 0.92.
 *
 * Must run after {@link resolveTrustSettings} has resolved `settings`' anchor fields to plain
 * strings.
 */
function toWireSettings(settings) {
    const { trust, tsaTrust, cawgTrust, ...rest } = {
        ...settings,
        ...(settings.tsaTrust && createTsaTrustSettings(settings.tsaTrust))
    };
    const anchors = [
        ...buildTrustAnchorEntries(trust, 'manifest'),
        ...buildTrustAnchorEntries(tsaTrust, 'tsa'),
        // Trusted ICA issuers are read from cawg entries only.
        ...buildTrustAnchorEntries(cawgTrust, 'cawg', cawgTrust?.trustedIcaIssuers)
    ];
    const wireSettings = rest;
    if (anchors.length > 0 || trust?.trustConfig) {
        wireSettings.trust = {
            ...(anchors.length > 0 ? { anchors } : {}),
            ...(trust?.trustConfig
                ? { trustConfig: trust.trustConfig }
                : {})
        };
    }
    return wireSettings;
}
function buildTrustAnchorEntries(settings, kind, trustedIcaIssuers) {
    // There's no upstream equivalent left for "run this trust kind's checks but report nothing" -
    // omitting its anchors is the closest approximation. Unlike before, validation still runs and
    // now reports an explicit "untrusted" status instead of staying silent.
    if (!settings || settings.verifyTrustList === false) {
        return [];
    }
    const trustConfig = settings.trustConfig;
    const allowedList = settings.allowedList;
    const issuers = trustedIcaIssuers?.length ? trustedIcaIssuers : undefined;
    const entryFields = {
        trustKind: kind,
        ...(trustConfig ? { trustConfig } : {}),
        ...(allowedList ? { allowedList } : {}),
        ...(issuers ? { trustedIcaIssuers: issuers } : {})
    };
    const entries = [];
    if (settings.userAnchors) {
        entries.push({
            trustAnchors: settings.userAnchors,
            trustUri: `${kind}_user_anchors`,
            ...entryFields
        });
    }
    if (settings.trustAnchors) {
        entries.push({
            trustAnchors: settings.trustAnchors,
            trustUri: `${kind}_system_anchors`,
            ...entryFields
        });
    }
    const hasAnchors = Boolean(settings.userAnchors || settings.trustAnchors);
    if (!hasAnchors && (allowedList || issuers)) {
        // The native base library reads allowed_list and trusted_ica_issuers only from a trust.anchors[] entry,
        // and every entry needs trust_anchors. An empty string adds no certificates.
        // trust_config is left out: it applies only to chains trusted through this entry's anchors.
        entries.push({
            trustAnchors: '',
            trustUri: `${kind}_ica_issuers`,
            trustKind: kind,
            ...(allowedList ? { allowedList } : {}),
            ...(issuers ? { trustedIcaIssuers: issuers } : {})
        });
    }
    return entries;
}
// =================================
// Settings construction
// =================================
/**
 * Create a Settings object with trust configuration.
 * @param trustConfig The trust configuration.
 * @returns Settings object that can be passed to Reader/Builder.
 */
export function createTrustSettings(trustConfig) {
    return { trust: { ...trustConfig } };
}
/**
 * Create a Settings object with timestamp trust configuration.
 * Only the fields of {@link TsaTrustSettings} are kept.
 * @param trustConfig The timestamp trust configuration.
 * @returns Settings object that can be passed to Reader/Builder.
 */
export function createTsaTrustSettings(trustConfig) {
    const { userAnchors, trustAnchors, verifyTrustList } = trustConfig;
    return {
        tsaTrust: {
            ...(userAnchors !== undefined ? { userAnchors } : {}),
            ...(trustAnchors !== undefined ? { trustAnchors } : {}),
            ...(verifyTrustList !== undefined ? { verifyTrustList } : {})
        }
    };
}
/**
 * Create a Settings object with CAWG trust configuration.
 * @param trustConfig The CAWG trust configuration.
 * @returns Settings object that can be passed to Reader/Builder.
 */
export function createCawgTrustSettings(trustConfig) {
    return { cawgTrust: { ...trustConfig } };
}
/**
 * Create a Settings object with verify configuration.
 * @param verifyConfig The verify configuration.
 * @returns Settings object that can be passed to Reader/Builder.
 */
export function createVerifySettings(verifyConfig) {
    return { verify: { ...verifyConfig } };
}
/**
 * Merge multiple Settings objects into one, deep-merging nested fields (e.g.
 * `builder.thumbnail`) rather than overwriting whole sections. Later settings override
 * earlier ones.
 *
 * @param settings Settings objects to merge.
 * @returns Merged settings object.
 */
export function mergeSettings(...settings) {
    return merge(...settings);
}
// =================================
// Serialization
// =================================
/**
 * Convert a settings object to a JSON string.
 * Converts camelCase keys to snake_case to match the c2pa-rs settings format.
 * @param settings The settings object
 * @returns JSON string representation with snake_case keys
 */
export function settingsToJson(settings) {
    return JSON.stringify(snakeCaseify(toWireSettings(settings)));
}
// =================================
// Loading
// =================================
/**
 * Load settings from a URL, retrying on network errors and retryable HTTP responses (see
 * {@link fetchWithRetryRaw}). Unlike {@link resolveTrustSettings}'s trust-anchor fetch, this
 * does not enforce a response-size cap or validate the content — it's meant for loading an
 * app's own trusted configuration file, not untrusted resources embedded in a manifest.
 *
 * @param url The URL to fetch the settings from
 * @param options Options for configuring the retry policy.
 * @returns Settings as a string
 */
export async function loadSettingsFromUrl(url, options) {
    const res = await fetchWithRetryRaw(url, undefined, options);
    return await res.text();
}
const TRUST_SETTINGS_KEYS = [
    'userAnchors',
    'trustAnchors',
    'trustConfig',
    'allowedList'
];
const inFlightTrustFetches = new Map();
const TRUST_FETCH_TIMEOUT_MS = 30_000;
const functionIds = new WeakMap();
let nextFunctionId = 0;
function getFunctionId(fn, defaultId) {
    if (!fn) {
        return defaultId;
    }
    let id = functionIds.get(fn);
    if (id === undefined) {
        id = ++nextFunctionId;
        functionIds.set(fn, id);
    }
    return String(id);
}
function getTrustFetchKey(url, options) {
    const fetchPolicy = [
        options?.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES,
        options?.maxRetries ?? DEFAULT_MAX_RETRIES,
        options?.initialRetryDelayMs ?? DEFAULT_INITIAL_RETRY_DELAY_MS,
        options?.maxRetryDelayMs ?? DEFAULT_MAX_RETRY_DELAY_MS,
        options?.maxRetryAfterMs ?? DEFAULT_MAX_RETRY_AFTER_MS,
        options?.requireHttps ?? false,
        getFunctionId(options?.isRetryableStatus, 'default-status'),
        getFunctionId(options?.isRetryableError, 'default-error'),
        getFunctionId(options?.signal, 'no-signal'),
        getFunctionId(globalThis.fetch, 'global-fetch')
    ];
    return JSON.stringify([url, ...fetchPolicy]);
}
function fetchTrustSetting(url, options) {
    validateFetchWithRetryOptions(options);
    const { deduplicateInFlight = true, requireHttps = false } = options ?? {};
    const parsedUrl = new URL(url);
    if (requireHttps && parsedUrl.protocol !== 'https:') {
        return Promise.reject(new Error(`Trust resource URL must use HTTPS: ${url}`));
    }
    if (options?.fetch || !deduplicateInFlight) {
        return executeTrustFetch(url, options);
    }
    const requestKey = getTrustFetchKey(url, options);
    const existing = inFlightTrustFetches.get(requestKey);
    if (existing) {
        return existing;
    }
    const request = executeTrustFetch(url, options);
    inFlightTrustFetches.set(requestKey, request);
    const clearRequest = () => {
        if (inFlightTrustFetches.get(requestKey) === request) {
            inFlightTrustFetches.delete(requestKey);
        }
    };
    void request.then(clearRequest, clearRequest);
    return request;
}
async function executeTrustFetch(url, options) {
    const controller = new AbortController();
    const fetchFn = options?.fetch ?? globalThis.fetch;
    const externalSignal = options?.signal;
    const requestSignal = externalSignal
        ? AbortSignal.any([controller.signal, externalSignal])
        : controller.signal;
    let timer;
    let removeAbortListener;
    const timeout = new Promise((_resolve, reject) => {
        timer = setTimeout(() => {
            const error = new DOMException(`Trust resource fetch timed out after ${TRUST_FETCH_TIMEOUT_MS} ms: ${url}`, 'TimeoutError');
            controller.abort(error);
            reject(error);
        }, TRUST_FETCH_TIMEOUT_MS);
    });
    const externalAbort = externalSignal
        ? new Promise((_resolve, reject) => {
            const onAbort = () => {
                reject(externalSignal.reason ??
                    new DOMException('The operation was aborted', 'AbortError'));
            };
            if (externalSignal.aborted) {
                onAbort();
            }
            else {
                externalSignal.addEventListener('abort', onAbort, { once: true });
                removeAbortListener = () => externalSignal.removeEventListener('abort', onAbort);
            }
        })
        : undefined;
    try {
        const request = fetchWithRetry(url, {
            ...options,
            fetch: (input, init) => {
                const requestInit = { ...init };
                if (options?.requireHttps) {
                    requestInit.redirect = 'error';
                }
                return fetchFn(input, requestInit);
            },
            signal: requestSignal
        });
        return await Promise.race(externalAbort ? [request, timeout, externalAbort] : [request, timeout]);
    }
    finally {
        clearTimeout(timer);
        removeAbortListener?.();
    }
}
/**
 * Walks a TrustSettings object and fetches trust resources if necessary, replacing URLs with
 * their fetched, validated values. Mutates `settings` in place.
 *
 * @param settings TrustSettings object, mutated in place.
 * @param options Optional configurations for fetch-with-retry.
 */
export async function resolveTrustSettings(settings, options) {
    const shouldValidateKey = (key) => ['userAnchors', 'trustAnchors'].includes(key);
    const containsCerts = (content) => content.includes('-----BEGIN CERTIFICATE-----');
    const isUrl = (str) => str.startsWith('http');
    try {
        const promises = Object.entries(settings)
            .filter(([key]) => TRUST_SETTINGS_KEYS.includes(key))
            .map(async ([key, val]) => {
            if (val && typeof val === 'object' && Array.isArray(val)) {
                const promises = val.map(async (val) => {
                    if (typeof val !== 'string') {
                        throw new Error('Expected a string value for array item');
                    }
                    const text = await fetchTrustSetting(val, options);
                    if (shouldValidateKey(key) && !containsCerts(text)) {
                        throw new Error(`Error parsing PEM file at: ${val}`);
                    }
                    return text;
                });
                const result = await Promise.all(promises);
                const combined = result.join('');
                settings[key] = combined;
            }
            else if (val && typeof val === 'string' && isUrl(val)) {
                const text = await fetchTrustSetting(val, options);
                if (shouldValidateKey(key) && !containsCerts(text)) {
                    throw new Error(`Error parsing PEM file at: ${val}`);
                }
                settings[key] = text;
            }
            else {
                return val;
            }
        });
        await Promise.all(promises);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const error = new Error(`Failed to resolve trust settings. ${message}`, {
            cause: e
        });
        if ((e instanceof Error || e instanceof DOMException) &&
            e.name === 'TimeoutError') {
            error.name = 'TimeoutError';
        }
        throw error;
    }
}
