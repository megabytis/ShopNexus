export const buildKey = (resource: string, params: Record<string, any> = {}): string => {
  let key = resource;

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      key += `:${k}=${v}`;
    }
  }

  console.log(key);

  return key;
};
