import { z } from "zod";

export const serverMetricsSchema = z
    .object({
        hostname: z.string().trim().min(1).max(100),
        cpu_usage: z.number().min(0).max(100),
        memory_usage: z.number().min(0).max(100),
        disk_usage: z.number().min(0).max(100),
        uptime_seconds: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
        timestamp: z.iso.datetime({ offset: true }),
    })
    .partial()
    .refine(
        (data) =>
            [data.cpu_usage, data.memory_usage, data.disk_usage, data.uptime_seconds].some(
                (value) => value !== undefined,
            ),
        { message: "At least one resource metric is required" },
    );

export type ServerMetrics = z.infer<typeof serverMetricsSchema>;

export function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}
