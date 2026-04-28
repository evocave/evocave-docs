// ─── Generic API Response ─────────────────────────────────────────────────────

export type ApiSuccess<T> = {
    data: T
    error: null
}

export type ApiError = {
    data: null
    error: string
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

// ─── Helper — fetch wrapper ────────────────────────────────────────────────────

export async function apiFetch<T>(
    url: string,
    options?: RequestInit
): Promise<ApiResult<T>> {
    try {
        const res = await fetch(url, options)
        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            return {
                data: null,
                error: (body as { error?: string }).error ?? `HTTP ${res.status}`
            }
        }
        const data = (await res.json()) as T
        return { data, error: null }
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Unknown error'
        }
    }
}