export function toIso(value) {
    if (!value) {
        return undefined;
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
export function asStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((entry) => String(entry));
}
export function asJsonRecord(value) {
    if (!value) {
        return undefined;
    }
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch {
            return undefined;
        }
    }
    if (typeof value === 'object') {
        return value;
    }
    return undefined;
}
//# sourceMappingURL=db-utils.js.map