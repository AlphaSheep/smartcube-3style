/** @jest-environment jsdom */

import { createCipheriv } from 'node:crypto';
import { createBluetooth } from './bluetooth';
import aes128 from './aes128';
import { createGiikerUtil } from './cstimer';

const SOLVED = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
const U_TURN = 'UUUUUUUUUBBBRRRRRRRRRFFFFFFDDDDDDDDDFFFLLLLLLLLLBBBBBB';
const MAC = '12:34:56:78:9a:bc';
const GAN_KEY = [1, 2, 66, 40, 49, 145, 22, 7, 32, 5, 24, 84, 66, 17, 18, 83];
const GAN_IV = [17, 3, 50, 40, 33, 1, 118, 39, 32, 149, 120, 20, 50, 18, 2, 67];
const MOYU_KEY = [21, 119, 58, 92, 103, 14, 45, 31, 23, 103, 42, 19, 155, 103, 82, 87];
const MOYU_IV = [17, 35, 38, 37, 134, 42, 44, 59, 85, 6, 127, 49, 126, 103, 33, 87];
const QIYI_KEY = [87, 177, 249, 171, 205, 90, 232, 167, 156, 185, 140, 231, 87, 140, 81, 8];

// Independent Node crypto implementation supplies encrypted notifications.
function encryptBlock(data: number[], key: number[]) {
  const cipher = createCipheriv('aes-128-ecb', Buffer.from(key), null);
  cipher.setAutoPadding(false);
  return [...Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()])];
}

function encryptGan(data: number[], baseKey = GAN_KEY, baseIv = GAN_IV) {
  const mac = MAC.split(':').map(byte => parseInt(byte, 16)).reverse();
  const key = baseKey.map((byte, i) => i < 6 ? (byte + mac[i]) % 255 : byte);
  const iv = baseIv.map((byte, i) => i < 6 ? (byte + mac[i]) % 255 : byte);
  const result = data.slice();
  result.splice(0, 16, ...encryptBlock(result.slice(0, 16).map((byte, i) => byte ^ iv[i]), key));
  if (result.length > 16) {
    const offset = result.length - 16;
    result.splice(offset, 16, ...encryptBlock(result.slice(offset).map((byte, i) => byte ^ iv[i]), key));
  }
  return result;
}

function packet(length = 20) {
  const bits = Array(length * 8).fill('0');
  return {
    set(offset: number, width: number, value: number) {
      bits.splice(offset, width, ...value.toString(2).padStart(width, '0'));
    },
    bytes() {
      return bits.join('').match(/.{8}/g).map(byte => parseInt(byte, 2));
    },
  };
}

function characteristic(uuid: string) {
  const listeners = new Map<string, Function>();
  return {
    uuid: uuid.toUpperCase(), // UUID lookup must be case-insensitive.
    startNotifications: jest.fn().mockResolvedValue(undefined),
    stopNotifications: jest.fn().mockResolvedValue(undefined),
    writeValue: jest.fn().mockResolvedValue(undefined),
    addEventListener: jest.fn((name, handler) => listeners.set(name, handler)),
    removeEventListener: jest.fn((name) => listeners.delete(name)),
    notify(bytes: number[]) {
      listeners.get('characteristicvaluechanged')?.({ target: { value: new DataView(Uint8Array.from(bytes).buffer) } });
    },
  };
}

function device(name: string, serviceUuid: string, readUuid: string, writeUuid = readUuid) {
  const read = characteristic(readUuid);
  const write = writeUuid === readUuid ? read : characteristic(writeUuid);
  const service = {
    uuid: serviceUuid.toUpperCase(),
    getCharacteristics: jest.fn().mockResolvedValue([read, write]),
    getCharacteristic: jest.fn(async (uuid) => uuid.toUpperCase() === read.uuid ? read : write),
  };
  const gatt = {
    connect: jest.fn(async () => gatt),
    disconnect: jest.fn(),
    getPrimaryServices: jest.fn().mockResolvedValue([service]),
    getPrimaryService: jest.fn().mockResolvedValue(service),
  };
  const listeners = new Map<string, Function>();
  return {
    name, gatt, read, write,
    addEventListener: jest.fn((name, handler) => listeners.set(name, handler)),
    removeEventListener: jest.fn((name) => listeners.delete(name)),
    disconnect: () => listeners.get('gattserverdisconnected')?.(new Event('gattserverdisconnected')),
    advertise: (manufacturerData: Map<number, DataView>) => listeners.get('advertisementreceived')?.({ manufacturerData }),
  };
}

let bluetooth;
let connections: ReturnType<typeof createBluetooth>[];

beforeEach(() => {
  bluetooth = { getAvailability: jest.fn().mockResolvedValue(true), requestDevice: jest.fn() };
  Object.defineProperty(navigator, 'bluetooth', { value: bluetooth, configurable: true });
  Object.defineProperty(navigator, 'userAgentData', { value: undefined, configurable: true });
  jest.spyOn(window, 'prompt').mockReturnValue(MAC);
  jest.spyOn(window, 'alert').mockImplementation(() => undefined);
  const stored = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: jest.fn((key) => stored.get(key) ?? null),
      setItem: jest.fn((key, value) => stored.set(key, value)),
    },
  });
  connections = [];
});

afterEach(async () => {
  await Promise.all(connections.map(connection => connection.stop()));
  jest.restoreAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
});

async function connect(target: ReturnType<typeof device>) {
  bluetooth.requestDevice.mockResolvedValue(target);
  const connection = createBluetooth();
  connections.push(connection);
  const callback = jest.fn();
  connection.setCallback(callback);
  await connection.init();
  expect(connection.getDeviceName()).toBe(target.name);
  expect(connection.isConnected()).toBe(true);
  return { connection, callback };
}

test('AES-128 matches the FIPS-197 encryption and decryption vector', () => {
  const key = [...Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex')];
  const plaintext = [...Buffer.from('00112233445566778899aabbccddeeff', 'hex')];
  const ciphertext = [...Buffer.from('69c4e0d86a7b0430d8cdb78070b4c55a', 'hex')];
  const cipher = aes128(key);
  expect(cipher.encrypt(plaintext.slice())).toEqual(ciphertext);
  expect(cipher.decrypt(ciphertext.slice())).toEqual(plaintext);
});

test('discovery includes existing and new cube families, services, and manufacturer IDs', async () => {
  bluetooth.requestDevice.mockRejectedValue(new Error('Cancelled'));
  const connection = createBluetooth();
  await expect(connection.init()).rejects.toThrow('Cancelled');
  const options = bluetooth.requestDevice.mock.calls[0][0];
  expect(options.filters.map(filter => filter.namePrefix)).toEqual(expect.arrayContaining([
    'Gi', 'Mi Smart Magic Cube', 'Hi-', 'GAN', 'MG', 'AiCube', 'GoCube', 'Rubiks', 'MHC',
    'WCU_MY3', 'QY-QYSC', 'XMD-TornadoV4-i',
  ]));
  expect(options.optionalServices).toContain('8653000a-43e6-47b7-9cb0-5fc21d4ae340');
  expect(options.optionalServices).toContain('00000010-0000-fff7-fff6-fff5fff4fff0');
  expect(options.optionalManufacturerData).toEqual(expect.arrayContaining([0x0000, 0xff00, 0x0001, 0xff01, 0x0504]));
  expect(new Set(options.optionalServices).size).toBe(options.optionalServices.length);
});

test('unavailable Bluetooth rejects before opening the chooser', async () => {
  bluetooth.getAvailability.mockResolvedValue(false);
  await expect(createBluetooth().init()).rejects.toThrow('Bluetooth API is not available');
  expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('check bluetooth is enabled on your device'));
  expect(bluetooth.requestDevice).not.toHaveBeenCalled();
});

test('missing Web Bluetooth shows CSTimer\'s Chrome guidance', async () => {
  Object.defineProperty(navigator, 'bluetooth', { value: undefined, configurable: true });
  await expect(createBluetooth().init()).rejects.toThrow('Bluetooth API is not available');
  expect(window.alert).toHaveBeenCalledWith('Bluetooth API is not available. Ensure https access, check bluetooth is enabled on your device, and try chrome with chrome://flags/#enable-experimental-web-platform-features enabled');
  expect(bluetooth.requestDevice).not.toHaveBeenCalled();
});

test.each([
  [2, '6e400001-b5a3-f393-e0a9-e50e24dc4179', '28be4cb6-cd67-11e9-a32f-2a2ae2dbcce4', '28be4a4a-cd67-11e9-a32f-2a2ae2dbcce4'],
  [3, '8653000a-43e6-47b7-9cb0-5fc21d4ae340', '8653000b-43e6-47b7-9cb0-5fc21d4ae340', '8653000c-43e6-47b7-9cb0-5fc21d4ae340'],
  [4, '00000010-0000-fff7-fff6-fff5fff4fff0', '0000fff6-0000-1000-8000-00805f9b34fb', '0000fff5-0000-1000-8000-00805f9b34fb'],
])('GAN v%i initializes, decrypts facelets and moves, and handles move counters', async (generation, service, read, write) => {
  const target = device('GAN-test', service, read, write);
  const { callback } = await connect(target);
  expect(target.write.writeValue).toHaveBeenCalledTimes(3);
  const state = packet();
  if (generation === 2) state.set(0, 4, 4);
  if (generation === 3) { state.set(0, 8, 0x55); state.set(8, 8, 2); state.set(16, 8, 17); }
  if (generation === 4) { state.set(0, 8, 0xed); state.set(8, 8, 18); }
  const cornerOffset = generation === 2 ? 12 : generation === 3 ? 40 : 32;
  const edgeOffset = generation === 2 ? 47 : generation === 3 ? 77 : 69;
  for (let i = 0; i < 7; i++) state.set(cornerOffset + i * 3, 3, i);
  for (let i = 0; i < 11; i++) state.set(edgeOffset + i * 4, 4, i);
  target.read.notify(encryptGan(state.bytes()));
  expect(callback.mock.calls[0][0]).toBe(SOLVED);
  expect(callback.mock.calls[0][1]).toEqual([]);
  const move = packet();
  if (generation === 2) {
    move.set(0, 4, 2); move.set(4, 8, 1); move.set(47, 16, 10);
  } else if (generation === 3) {
    move.set(0, 8, 0x55); move.set(8, 8, 1); move.set(16, 8, 7);
    move.set(24, 8, 10); move.set(56, 8, 1); move.set(72, 8, 2);
  } else {
    move.set(0, 8, 1); move.set(8, 8, 7); move.set(16, 8, 10);
    move.set(48, 8, 1); move.set(64, 8, 2);
  }
  target.read.notify(encryptGan(move.bytes()));
  expect(callback.mock.calls[1][0]).toBe(U_TURN);
  expect(callback.mock.calls[1][1][0]).toBe('U ');
  target.read.notify(encryptGan(move.bytes()));
  expect(callback).toHaveBeenCalledTimes(2);
  if (generation > 2) {
    // Move 2 was lost. Move 3 must wait until the cube's history fills the gap.
    move.set(generation === 3 ? 56 : 48, 8, 3);
    target.read.notify(encryptGan(move.bytes()));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(target.write.writeValue).toHaveBeenCalledTimes(4);
    const history = packet();
    if (generation === 3) {
      history.set(0, 8, 0x55); history.set(8, 8, 6); history.set(16, 8, 2);
      history.set(24, 8, 3); history.set(32, 8, 0x22);
    } else {
      history.set(0, 8, 0xd1); history.set(8, 8, 2);
      history.set(16, 8, 3); history.set(24, 8, 0x22);
    }
    target.read.notify(encryptGan(history.bytes()));
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback.mock.calls[2][1][0]).toBe('U ');
    expect(callback.mock.calls[3][1][0]).toBe('U ');
    expect(callback.mock.calls[3][0]).toBe('UUUUUUUUUFFFRRRRRRLLLFFFFFFDDDDDDDDDBBBLLLLLLRRRBBBBBB');
  }
});

test('manufacturer advertisements supply the MAC without a prompt, ignoring empty packets', async () => {
  jest.useFakeTimers();
  const target = device('GAN-test', '8653000a-43e6-47b7-9cb0-5fc21d4ae340',
    '8653000b-43e6-47b7-9cb0-5fc21d4ae340', '8653000c-43e6-47b7-9cb0-5fc21d4ae340');
  target.watchAdvertisements = jest.fn(async () => {
    target.advertise(new Map());
    target.advertise(new Map([[0x0001, new DataView(Uint8Array.from([0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12]).buffer)]]));
  });
  await connect(target);
  expect(window.prompt).not.toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem('macMap'))['GAN-test']).toBe(MAC);
});

test('Linux uses the manual MAC fallback without waiting for advertisements', async () => {
  Object.defineProperty(navigator, 'userAgentData', { value: { platform: 'Linux' }, configurable: true });
  const target = device('GAN-test', '8653000a-43e6-47b7-9cb0-5fc21d4ae340',
    '8653000b-43e6-47b7-9cb0-5fc21d4ae340', '8653000c-43e6-47b7-9cb0-5fc21d4ae340');
  target.watchAdvertisements = jest.fn();
  await connect(target);
  expect(target.watchAdvertisements).not.toHaveBeenCalled();
  expect(window.prompt).toHaveBeenCalled();
});

test('MoYu 32 initializes and decrypts a state followed by a move', async () => {
  const target = device('WCU_MY32_ABCD', '0783b03e-7735-b5a0-1760-a305d2795cb0',
    '0783b03e-7735-b5a0-1760-a305d2795cb1', '0783b03e-7735-b5a0-1760-a305d2795cb2');
  const { callback } = await connect(target);
  const state = packet();
  state.set(0, 8, 0xa3);
  for (let face = 0; face < 6; face++) {
    for (let i = 0; i < 8; i++) state.set(8 + face * 24 + i * 3, 3, face);
  }
  target.read.notify(encryptGan(state.bytes(), MOYU_KEY, MOYU_IV));
  expect(callback.mock.calls[0][0]).toBe(SOLVED);
  const move = packet();
  move.set(0, 8, 0xa5); move.set(8, 16, 10); move.set(88, 8, 1); move.set(96, 5, 4);
  target.read.notify(encryptGan(move.bytes(), MOYU_KEY, MOYU_IV));
  expect(callback.mock.calls[1][0]).toBe(U_TURN);
  expect(callback.mock.calls[1][1][0]).toBe('U ');
});

function qiyiNotification(opcode: number, facelets: string, timestamp: number, move = 0, corrupt = false) {
  const msg = Array(opcode === 2 ? 38 : 93).fill(0);
  msg[0] = 0xfe; msg[1] = msg.length; msg[2] = opcode;
  msg[6] = timestamp; msg[34] = move; msg[35] = 80;
  for (let i = 0; i < 54; i++) msg[7 + (i >> 1)] |= 'LRDUFB'.indexOf(facelets[i]) << (i % 2 * 4);
  let crc = 0xffff;
  for (const byte of msg.slice(0, -2)) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? crc >> 1 ^ 0xa001 : crc >> 1;
  }
  msg[msg.length - 2] = crc & 0xff;
  msg[msg.length - 1] = crc >> 8;
  if (corrupt) msg[msg.length - 1] ^= 1;
  while (msg.length % 16) msg.push(0);
  return msg.flatMap((_, i) => i % 16 ? [] : encryptBlock(msg.slice(i, i + 16), QIYI_KEY));
}

test.each(['QY-QYSC-S-ABCD', 'XMD-TornadoV4-i-S-ABCD'])('%s decrypts state and moves and rejects a bad CRC', async (name) => {
  const target = device(name, '0000fff0-0000-1000-8000-00805f9b34fb', '0000fff6-0000-1000-8000-00805f9b34fb');
  const { connection, callback } = await connect(target);
  target.read.notify(qiyiNotification(2, SOLVED, 16));
  expect(callback.mock.calls[0][0]).toBe(SOLVED);
  target.read.notify(qiyiNotification(3, U_TURN, 32, 8));
  expect(callback.mock.calls[1][0]).toBe(U_TURN);
  expect(callback.mock.calls[1][1][0]).toBe('U ');
  expect(await connection.getCube().getBatteryLevel()).toEqual([80, name]);
  target.read.notify(qiyiNotification(3, U_TURN, 48, 8, true));
  expect(callback).toHaveBeenCalledTimes(2);
});

test('existing GoCube moves still arrive and disconnect removes notifications', async () => {
  const target = device('GoCube-test', '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    '6e400003-b5a3-f393-e0a9-e50e24dcca9e', '6e400002-b5a3-f393-e0a9-e50e24dcca9e');
  const { connection, callback } = await connect(target);
  target.read.notify([0x2a, 8, 1, 4, 0, 0, 0x0d, 0x0a]);
  expect(callback.mock.calls[0][0]).toBe(U_TURN);
  expect(callback.mock.calls[0][1][0]).toBe('U ');
  const eventCallback = jest.fn();
  connection.setEventCallback(eventCallback);
  await target.disconnect();
  expect(connection.isConnected()).toBe(false);
  expect(target.read.stopNotifications).toHaveBeenCalledTimes(1);
  expect(target.read.removeEventListener).toHaveBeenCalled();
  expect(target.gatt.disconnect).toHaveBeenCalledTimes(1);
  expect(eventCallback).toHaveBeenCalledWith('disconnect', expect.any(Event));
});

test.each([false, true])('manual MAC prompts preserve guidance without line breaks (wrong MAC: %s)', (isWrongKey) => {
  const util = createGiikerUtil(() => 'GAN-test');
  expect(util.reqMacAddr(true, isWrongKey, undefined, MAC)).toBe(MAC);
  const [message, defaultValue] = jest.mocked(window.prompt).mock.calls[0];
  expect(message).toContain('chrome://bluetooth-internals/#devices');
  expect(message).toContain('Chrome: Turn on chrome://flags/#enable-experimental-web-platform-features');
  expect(message).toContain('Bluefy: Turn on Enable BLE Advertisements');
  expect(message).not.toMatch(/[\r\n]/);
  if (isWrongKey) expect(message).toMatch(/^The MAC provided might be wrong! Please enter/);
  expect(defaultValue).toBe(MAC);
  expect(JSON.parse(localStorage.getItem('macMap'))['GAN-test']).toBe(MAC);
});

test('MAC prompts retain the existing storage key and reject invalid input', () => {
  const util = createGiikerUtil(() => 'GAN-test');
  localStorage.setItem('macMap', JSON.stringify({ 'GAN-test': MAC }));
  expect(util.reqMacAddr(false, false)).toBe(MAC);
  expect(window.prompt).not.toHaveBeenCalled();
  window.prompt.mockReturnValue('invalid');
  expect(() => util.reqMacAddr(true, true)).toThrow('Not a valid mac address, cannot connect to your smart cube');
  expect(window.prompt).toHaveBeenCalledWith(expect.stringMatching(/^The MAC provided might be wrong! Please enter the MAC address/), MAC);
  expect(window.alert).toHaveBeenCalledWith('Not a valid mac address, cannot connect to your smart cube');
  expect(JSON.parse(localStorage.getItem('macMap'))['GAN-test']).toBe(MAC);
});

test.each([
  ['GAN-test', '8653000a-43e6-47b7-9cb0-5fc21d4ae340', '8653000b-43e6-47b7-9cb0-5fc21d4ae340', '8653000c-43e6-47b7-9cb0-5fc21d4ae340'],
  ['WCU_MY32_ABCD', '0783b03e-7735-b5a0-1760-a305d2795cb0', '0783b03e-7735-b5a0-1760-a305d2795cb1', '0783b03e-7735-b5a0-1760-a305d2795cb2'],
  ['QY-QYSC-S-ABCD', '0000fff0-0000-1000-8000-00805f9b34fb', '0000fff6-0000-1000-8000-00805f9b34fb', '0000fff6-0000-1000-8000-00805f9b34fb'],
])('%s rejects an invalid MAC before sending commands', async (name, service, read, write) => {
  const target = device(name, service, read, write);
  bluetooth.requestDevice.mockResolvedValue(target);
  window.prompt.mockReturnValue('invalid');
  const connection = createBluetooth();
  connections.push(connection);
  await expect(connection.init()).rejects.toThrow('Not a valid mac address, cannot connect to your smart cube');
  expect(connection.isConnected()).toBe(false);
  expect(target.gatt.disconnect).toHaveBeenCalledTimes(1);
  expect(window.alert).toHaveBeenCalledWith('Not a valid mac address, cannot connect to your smart cube');
  expect(target.write.writeValue).not.toHaveBeenCalled();
});

test('unsupported cubes retain the upstream warning', async () => {
  const target = device('GAN-test', 'unknown-service', 'unknown-characteristic');
  bluetooth.requestDevice.mockResolvedValue(target);
  const connection = createBluetooth();
  connections.push(connection);
  await expect(connection.init()).rejects.toThrow('Not support your smart cube');
  expect(window.alert).toHaveBeenCalledWith('Not support your smart cube');
  expect(connection.isConnected()).toBe(false);
});
