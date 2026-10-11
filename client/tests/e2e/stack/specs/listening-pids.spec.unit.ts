import { parseLsofPids, parseNetstatListeners } from '../listening-pids';

// A `netstat -ano` excerpt of a Windows stand: Nest on 5300 (IPv4 + IPv6), Vite on 5400 ([::1] only), a
// connection to each, a TIME_WAIT row with pid 0 and a UDP row without a state.
const NETSTAT_OUTPUT = `
Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:5300           0.0.0.0:0              LISTENING       38276
  TCP    0.0.0.0:5301           0.0.0.0:0              LISTENING       40864
  TCP    [::]:5300              [::]:0                 LISTENING       38276
  TCP    [::1]:5400             [::]:0                 LISTENING       40928
  TCP    [::1]:5400             [::1]:52160            ESTABLISHED     40928
  TCP    [::1]:53770            [::1]:5300             TIME_WAIT       0
  TCP    127.0.0.1:53000        0.0.0.0:0              LISTENING       15300
  UDP    0.0.0.0:5300           *:*                                    4321
`;

describe('parseNetstatListeners', () => {
  it('returns the listener of a port once, across IPv4 and IPv6', () => {
    expect(parseNetstatListeners(NETSTAT_OUTPUT, 5300)).toEqual([38276]);
    expect(parseNetstatListeners(NETSTAT_OUTPUT, 5400)).toEqual([40928]);
  });

  it('ignores other ports, connections, TIME_WAIT rows and UDP', () => {
    expect(parseNetstatListeners(NETSTAT_OUTPUT, 5302)).toEqual([]);
    expect(parseNetstatListeners(NETSTAT_OUTPUT, 53770)).toEqual([]);
    expect(parseNetstatListeners(NETSTAT_OUTPUT, 52160)).toEqual([]);
  });

  it('matches the whole port, not a prefix', () => {
    expect(parseNetstatListeners(NETSTAT_OUTPUT, 530)).toEqual([]);
  });

  it('returns nothing for output it does not understand', () => {
    expect(parseNetstatListeners('', 5300)).toEqual([]);
    expect(parseNetstatListeners('TCP 5300 LISTENING', 5300)).toEqual([]);
  });
});

describe('parseLsofPids', () => {
  it('returns each pid once, skipping blank lines', () => {
    expect(parseLsofPids('38276\n38276\n\n')).toEqual([38276]);
    expect(parseLsofPids('')).toEqual([]);
  });
});
