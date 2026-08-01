type PingResponse = {
  status: string;
  message: string;
  timestamp: string;
};

async function getPing() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ping`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    return { data: (await res.json()) as PingResponse, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export default async function ApiTestPage() {
  const { data, error } = await getPing();

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold">API connection test</h1>

      {data ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm">
          <p className="font-medium text-green-600">✅ Connected to backend</p>
          <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm">
          <p className="font-medium text-red-600">❌ Could not reach backend</p>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <p className="mt-2 text-muted-foreground">
            Make sure the Laravel server is running (php artisan serve) and
            NEXT_PUBLIC_API_URL in .env.local points to it.
          </p>
        </div>
      )}
    </main>
  );
}
