function omit(obj, propsToOmit) {
  const result = { ...obj };
  propsToOmit.forEach(prop => delete result[prop]);
  return result;
}

module.exports = {
  omit,
}