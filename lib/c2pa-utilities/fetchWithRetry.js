/**
 * Copyright 2026 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */
/**
 * This file implements a generic HTTP fetch-with-retry mechanism, using exponential backoff and
 * `Retry-After` handling. The retry mechanism itself (the loop, backoff calculation, and
 * `Retry-After` handling) is fixed; the policy around it — retry count, backoff timing, which
 * statuses are retryable, and the maximum honored `Retry-After` delay — is configurable per
 * caller via {@link FetchWithRetryOptions}, so different consumers (browser vs. server, or
 * different Adobe-internal call sites) can inject their own policy without forking the
 * mechanism.
 */
/**
 * Default maximum response size, in bytes, when {@link FetchWithRetryOptions.maxResponseBytes}
 * isn't specified. Only enforced by {@link fetchWithRetry}'s text response handling —
 * {@link fetchWithRetryRaw} returns the raw `Response` and does not enforce a size cap.
 */
export const DEFAULT_MAX_RESPONSE_BYTES = 1 * 1024 * 1024; // 1MB
/**
 * Default fetch-with-retry policy values, used whenever the corresponding
 * {@link FetchWithRetryOptions} field is omitted.
 */
export const DEFAULT_MAX_RETRIES = 2;
export const DEFAULT_INITIAL_RETRY_DELAY_MS = 200;
export const DEFAULT_MAX_RETRY_DELAY_MS = 2_000;
export const DEFAULT_MAX_RETRY_AFTER_MS = 30_000;
/**
 * @param status An HTTP response status code.
 * @returns Whether the given status is retryable, by default: `429` or any `5xx` status.
 */
export function defaultIsRetryableStatus(status) {
    return status === 429 || status >= 500;
}
/** @internal */
export function validateFetchWithRetryOptions(options) {
    const keys = [
        'maxResponseBytes',
        'maxRetries',
        'initialRetryDelayMs',
        'maxRetryDelayMs',
        'maxRetryAfterMs'
    ];
    for (const key of keys) {
        const value = options?.[key];
        if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
            throw new Error(`${key} must be a non-negative finite number`);
        }
    }
    if (options?.maxRetries !== undefined &&
        !Number.isSafeInteger(options.maxRetries)) {
        throw new Error('maxRetries must be a non-negative safe integer');
    }
}
/**
 * @param error The error to check, usually from a `fetch` call.
 * @returns Whether `error` represents a deliberate `AbortError`.
 */
function isAbortError(error) {
    return error instanceof Error && error.name === 'AbortError';
}
function getAbortReason(signal) {
    return (signal.reason ?? new DOMException('The operation was aborted', 'AbortError'));
}
function throwIfAborted(signal) {
    if (signal?.aborted) {
        throw getAbortReason(signal);
    }
}
function waitForRetry(delayMs, signal) {
    throwIfAborted(signal);
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, delayMs);
        const onAbort = () => {
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
            if (signal) {
                reject(getAbortReason(signal));
            }
        };
        signal?.addEventListener('abort', onAbort, { once: true });
        if (signal?.aborted) {
            onAbort();
        }
    });
}
/**
 * @param attempt The current attempt number.
 * @param initialDelayMs Initial backoff delay, in milliseconds.
 * @param maxDelayMs Maximum backoff delay (before jitter), in milliseconds.
 * @returns The backoff time for the current attempt number in milliseconds,
 * in accordance with an exponential backoff policy.
 */
function calculateBackoffMs(attempt, initialDelayMs, maxDelayMs) {
    const backoff = Math.min(initialDelayMs * 2 ** attempt, maxDelayMs);
    const jitter = Math.floor(Math.random() * 200);
    return Math.min(backoff + jitter, maxDelayMs); // jitter, capped
}
/**
 * Parses a `Retry-After` header value, which per HTTP spec is either a number of
 * seconds or an HTTP date.
 * @param value The `Retry-After` header value.
 * @returns the delay in milliseconds, or null if the header is absent or unparseable.
 */
function parseRetryAfterMs(value) {
    if (!value) {
        return null;
    }
    const seconds = Number(value);
    if (!Number.isNaN(seconds)) {
        return seconds * 1000;
    }
    const dateMs = Date.parse(value);
    if (Number.isNaN(dateMs)) {
        return null;
    }
    return dateMs - Date.now();
}
/**
 * @param input A URL string to validate.
 * @throws if `input` is not a well-formed, absolute URL.
 */
function assertValidUrl(input) {
    try {
        new URL(input);
    }
    catch {
        throw new Error(`Invalid URL: ${input}`);
    }
}
/**
 * Fetches `input`, retrying on network errors and on responses whose status is deemed
 * retryable (see {@link FetchWithRetryOptions.isRetryableStatus}), with exponential backoff
 * (respecting a `Retry-After` header when present). Gives up on receiving `AbortError` and
 * does not retry. Aborting a supplied signal also stops pending retry delays and propagates
 * the signal's reason.
 *
 * Callers are responsible for reading and validating the body themselves (e.g. `.json()`,
 * `.text()`, streaming, or their own size cap), which makes this suitable for arbitrary
 * requests (custom methods, headers, bodies) rather than just simple GETs.
 *
 * @param input The URL to fetch. Validated up front — a malformed URL throws immediately
 * rather than being retried, since it can never succeed.
 * @param init Standard `fetch` request options (method, headers, body, signal, etc.).
 * @param options Options for configuring the retry policy.
 * @returns The successful response.
 */
export async function fetchWithRetryRaw(input, init, options) {
    assertValidUrl(input);
    validateFetchWithRetryOptions(options);
    const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    const initialRetryDelayMs = options?.initialRetryDelayMs ?? DEFAULT_INITIAL_RETRY_DELAY_MS;
    const maxRetryDelayMs = options?.maxRetryDelayMs ?? DEFAULT_MAX_RETRY_DELAY_MS;
    const maxRetryAfterMs = options?.maxRetryAfterMs ?? DEFAULT_MAX_RETRY_AFTER_MS;
    const isRetryableStatus = options?.isRetryableStatus ?? defaultIsRetryableStatus;
    const isRetryableError = options?.isRetryableError ?? (() => true);
    const fetchFn = options?.fetch ?? fetch;
    const signal = init?.signal && options?.signal && init.signal !== options.signal
        ? AbortSignal.any([init.signal, options.signal])
        : (init?.signal ?? options?.signal);
    const requestInit = signal ? { ...init, signal } : init;
    const backoff = (attempt) => calculateBackoffMs(attempt, initialRetryDelayMs, maxRetryDelayMs);
    for (let attempt = 0;; attempt++) {
        throwIfAborted(signal);
        let res;
        try {
            res = await fetchFn(input, requestInit);
        }
        catch (e) {
            if (signal?.aborted) {
                throw getAbortReason(signal);
            }
            if (!isAbortError(e) && isRetryableError(e) && attempt < maxRetries) {
                await waitForRetry(backoff(attempt), signal);
                continue;
            }
            const message = e instanceof Error ? e.message : String(e);
            throw new Error(`Network error fetching ${input}: ${message}`, {
                cause: e
            });
        }
        throwIfAborted(signal);
        if (!res.ok) {
            const retryable = isRetryableStatus(res.status);
            if (retryable) {
                const retryAfterMs = parseRetryAfterMs(res.headers.get('retry-after'));
                if (retryAfterMs !== null) {
                    if (retryAfterMs > maxRetryAfterMs) {
                        throw new Error(`Failed to fetch ${input}: server requested a Retry-After delay of ` +
                            `${Math.ceil(retryAfterMs / 1000)}s, which exceeds the maximum allowed delay of ` +
                            `${maxRetryAfterMs / 1000}s`);
                    }
                    if (attempt < maxRetries) {
                        await waitForRetry(Math.max(retryAfterMs, 0), signal);
                        continue;
                    }
                    throw new Error(`Failed to fetch ${input}: ${res.status} ${res.statusText}`);
                }
                if (attempt < maxRetries) {
                    await waitForRetry(backoff(attempt), signal);
                    continue;
                }
            }
            throw new Error(`Failed to fetch ${input}: ${res.status} ${res.statusText}`);
        }
        return res;
    }
}
/**
 * Fetches `url` as text, retrying on network errors, `429`, and `5xx` responses with
 * exponential backoff (respecting a `Retry-After` header when present), and enforcing a
 * maximum response size. A thin convenience wrapper around {@link fetchWithRetryRaw} for the
 * common GET-and-read-as-text case; use {@link fetchWithRetryRaw} directly for other methods,
 * request bodies, or response handling.
 *
 * The size cap is checked against the `Content-Length` header first, before reading the body,
 * to reject an oversized response without buffering it into memory. `Content-Length` is
 * optional, though (e.g. chunked transfer-encoding omits it), so the body's actual length is
 * still checked afterward as a fallback for responses that didn't send an (accurate) header.
 *
 * @param url The URL to fetch.
 * @param options Options for configuring the fetch.
 * @returns The response body.
 */
export async function fetchWithRetry(url, options) {
    const maxResponseBytes = options?.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
    const res = await fetchWithRetryRaw(url, undefined, options);
    const contentLengthHeader = res.headers.get('content-length');
    if (contentLengthHeader !== null && Number(contentLengthHeader) > maxResponseBytes) {
        throw new Error(`Response from ${url} is too large. Max size is ${maxResponseBytes} bytes.`);
    }
    const text = await res.text();
    if (text.length > maxResponseBytes) {
        throw new Error(`Response from ${url} is too large. Max size is ${maxResponseBytes} bytes.`);
    }
    return text;
}
