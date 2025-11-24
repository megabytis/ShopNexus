const buildKey = (resource, params = {}) => {
  let key = resource;

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      key += `:${k}=${v}`;
    }
  }

  console.log(key);

  return key;
};

module.exports = { buildKey };
