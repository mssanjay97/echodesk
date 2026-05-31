export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);

    return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}