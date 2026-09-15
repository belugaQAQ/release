export async function apiJson<T>(response: Response): Promise<T> {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || body.error || '请求失败');
    return body as T;
}

export function downloadJson(data: unknown, filename: string) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export type Release = {version: string; url: string; size: number; changelog: string; sha256: string; releaseDate: string};
export type Echo = {id: string | number; text: string; user: string; created_at?: string};
export type ReleaseForm = {version: string; url: string; size: string; changelog: string; sha256: string};
