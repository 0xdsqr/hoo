import { serve, RedisClient } from "bun";

const createRedis = (password = "changeme") => {
    const client = new RedisClient(`redis://:${password}@127.0.0.1:6379`);

    return {
        ping: () => client.ping(),
        raw: client,
    };
};

export const createCockroach = (database = "defaultdb") => {
    return {
        health: () =>
            fetch("http://127.0.0.1:8080/health")
                .then((r) => r.ok)
                .catch(() => false),
    };
};

serve({
    hostname: "0.0.0.0",
    port: 3002,

    routes: {
        "/health/readyz": async () => {
            const redis = createRedis();
            const cock = createCockroach();

            const [r, c] = await Promise.all([
                redis
                    .ping()
                    .then(() => true)
                    .catch(() => false),
                cock.health(),
            ]);
            return Response.json({ ok: r && c, redis: r, cockroach: c });
        },
    },

    async fetch() {
        return new Response("Not Found", { status: 404 });
    },
});
