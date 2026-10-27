export const traffic = {
    "1h": {
        requests: "18,420",
        average: "307 req/min",
        values: [
            180, 220, 195, 280, 245, 310, 270, 380, 330, 290, 340, 410, 350, 320, 370, 440, 390,
            360, 420, 380, 310, 340, 290, 330,
        ],
        labels: ["13:00", "13:15", "13:30", "13:45", "14:00"],
    },
    "24h": {
        requests: "284,902",
        average: "198 req/min",
        values: [
            90, 70, 55, 60, 75, 110, 180, 240, 310, 270, 350, 390, 320, 290, 340, 420, 360, 310,
            240, 210, 180, 160, 130, 110,
        ],
        labels: ["00:00", "06:00", "12:00", "18:00", "23:59"],
    },
    "7d": {
        requests: "1,982,740",
        average: "197 req/min",
        values: [
            140, 210, 180, 260, 220, 290, 250, 190, 240, 320, 280, 360, 310, 260, 330, 400, 340,
            290, 370, 430, 380,
        ],
        labels: ["Mon", "Wed", "Fri", "Sun"],
    },
} as const;

export type TrafficRange = keyof typeof traffic;

export const services = [
    {
        id: "api",
        name: "Application API",
        detail: "FastAPI · 4 workers",
        status: "Healthy",
        tone: "success",
        latency: "42 ms",
        uptime: "99.99%",
    },
    {
        id: "database",
        name: "Primary database",
        detail: "PostgreSQL · 24 connections",
        status: "Healthy",
        tone: "success",
        latency: "8 ms",
        uptime: "100%",
    },
    {
        id: "cache",
        name: "Cache & sessions",
        detail: "Redis · 96.4% hit rate",
        status: "Healthy",
        tone: "success",
        latency: "2 ms",
        uptime: "100%",
    },
    {
        id: "ai",
        name: "AI inference",
        detail: "Model gateway · 3 providers",
        status: "Degraded",
        tone: "warning",
        latency: "1,240 ms",
        uptime: "99.82%",
    },
    {
        id: "worker",
        name: "Background workers",
        detail: "2 workers · 12 queued jobs",
        status: "Healthy",
        tone: "success",
        latency: "94 ms",
        uptime: "99.98%",
    },
] as const;

export const activity = [
    {
        id: "1",
        title: "Daily backup completed",
        detail: "2.4 GB snapshot saved to storage",
        time: "2 min ago",
        type: "backup",
    },
    {
        id: "2",
        title: "Model response time increased",
        detail: "AI gateway exceeded the 1s threshold",
        time: "8 min ago",
        type: "warning",
    },
    {
        id: "3",
        title: "Deployment successful",
        detail: "Release v1.8.2 · all checks passed",
        time: "24 min ago",
        type: "deploy",
    },
    {
        id: "4",
        title: "New workspace members",
        detail: "8 users joined in the last hour",
        time: "42 min ago",
        type: "users",
    },
] as const;

export const jobs = [
    { label: "Document processing", value: "8", detail: "queued", percent: 40 },
    { label: "Embedding generation", value: "3", detail: "running", percent: 60 },
    { label: "Research tasks", value: "1", detail: "running", percent: 25 },
] as const;
