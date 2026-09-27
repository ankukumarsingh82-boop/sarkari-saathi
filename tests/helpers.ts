export async function withEnv(values: Record<string, string | undefined>, run: () => Promise<void>): Promise<void> {
  const saved = new Map<string, string | undefined>();
  for (const key of Object.keys(values)) saved.set(key, process.env[key]);
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    await run();
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

export function stalledFetch(_input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    const signal = init?.signal;
    const abort = () => reject(new DOMException("The operation was aborted.", "AbortError"));
    if (!signal) {
      reject(new Error("missing abort signal"));
      return;
    }
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}
