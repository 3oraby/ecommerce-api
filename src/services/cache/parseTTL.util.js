exports.parseTTL = (ttl) => {
  if (!ttl) return 60;

  const num = parseInt(ttl);

  if (ttl.includes("m")) return num * 60;
  if (ttl.includes("h")) return num * 60 * 60;
  if (ttl.includes("d")) return num * 60 * 60 * 24;
  if (ttl.includes("w")) return num * 60 * 60 * 24 * 7;
  if (ttl.includes("M")) return num * 60 * 60 * 24 * 30;
  if (ttl.includes("Y")) return num * 60 * 60 * 24 * 365;

  return num;
};
