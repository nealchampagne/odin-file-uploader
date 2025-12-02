const parseDuration = str => {
  const match = str.match(/^(\d+)(d)$/);
  if (!match) throw new Error('Invalid duration');
  return parseInt(match[1]) * 24 * 60 * 60 * 1000;
};

module.exports = parseDuration;