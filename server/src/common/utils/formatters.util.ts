export function formatString(...rest) {
  const args = rest;

  if (Array.isArray(args[0])) {
    const parameters = args[0];

    for (let i = 0; i < parameters.length; ++i) {
      args[i] = parameters[i];
    }
  }

  return this.replace(/{(\d+)}/g, function (match, matchIndex) {
    return typeof args[matchIndex] !== 'undefined' ? args[matchIndex] : match;
  });
}
