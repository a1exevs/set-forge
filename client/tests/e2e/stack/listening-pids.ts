/**
 * Parsers of the system tools that tell who listens on a TCP port — pure, so `specs/` can feed them sample output.
 * `api-stack.ts` runs the tools and hands their output here.
 */

/**
 * The pids listening on `port` in `netstat -ano` output. Without `-p` netstat lists IPv4 and IPv6 alike
 * (`0.0.0.0:5300`, `[::]:5300`, Vite's `[::1]:5400`); only `LISTENING` rows count, the others (ESTABLISHED,
 * TIME_WAIT with pid 0, UDP without a state) do not.
 */
export function parseNetstatListeners(output: string, port: number): number[] {
  return [
    ...new Set(
      output
        .split('\n')
        .map(line => /^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$/.exec(line))
        .filter((match): match is RegExpExecArray => match !== null && Number(match[1]) === port)
        .map(match => Number(match[2])),
    ),
  ];
}

/** The pids in `lsof -t` output: one per line, the same pid once per socket (IPv4 and IPv6). */
export function parseLsofPids(output: string): number[] {
  return [
    ...new Set(
      output
        .split('\n')
        .map(line => Number(line))
        .filter(Boolean),
    ),
  ];
}
