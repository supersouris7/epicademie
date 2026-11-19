import { describe, expect, it } from 'vitest';
import type os from 'node:os';
import { detectLanAddress } from './lan.ts';

const iface = (address: string, internal = false): os.NetworkInterfaceInfo => ({
  address,
  family: 'IPv4',
  internal,
  netmask: '',
  mac: '',
  cidr: null,
});

describe('detectLanAddress', () => {
  it('préfère une adresse privée', () => {
    expect(
      detectLanAddress({ lo: [iface('127.0.0.1', true)], docker0: [iface('8.8.8.8')], wlan0: [iface('192.168.1.20')] }),
    ).toBe('192.168.1.20');
  });
  it('renvoie null sans interface externe', () => {
    expect(detectLanAddress({ lo: [iface('127.0.0.1', true)] })).toBeNull();
  });
});
