exports.parseTTL = (ttl) => {
  if (!ttl) return 60;

  const num = parseInt(ttl);

  if (ttl.includes("m")) return num * 60;
  if (ttl.includes("h")) return num * 60 * 60;

  return num;
};
