export const firebaseBaseQuery =
  ({ baseUrl }) =>
  async ({ url, method, body }) => {
    try {
      const res = await fetch(`${baseUrl}${url}.json`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: { status: res.status, data } };
      }

      return { data };
    } catch (error) {
      return { error };
    }
  };
