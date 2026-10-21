Bluetooth drivers and shared math/AES code are adapted from [CSTimer commit 2547d82e32a347dd1b1c6943e8d03389d03eb64c](https://github.com/cs0x7f/cstimer/tree/2547d82e32a347dd1b1c6943e8d03389d03eb64c/src/js), under GPLv3. `isaac.ts` retains its upstream MIT license notice.

The cube modules retain upstream protocol code and formatting. Their `execMain` wrappers become exported registration functions; imports supply their dependencies. The MoYu 32 wrapper supplies an empty navigator when loaded in Node tests. The Giiker debug scramble-generator log is omitted.

`bluetooth.ts` retains the upstream device-group factory, adds `getDeviceName`, and registers the six cube drivers through the app's `createBluetooth` interface. The app wrapper cleans up failed connections. Bluetooth timer drivers are not included.

`cstimer.ts` supplies the small subset of jQuery and CSTimer helpers needed by the drivers, including MAC-address prompts and the `macMap` local storage entry. Its Bluetooth messages come from CSTimer's `src/lang/en-us.js`; preserve their full setup and troubleshooting instructions. Invalid MAC addresses and unsupported cubes show the upstream warning and reject the connection. CSTimer's custom solved-state reset and battery UI hooks are inactive. `mathlib.ts` and the AES portion of upstream `sha256.js` are exported as modules; ISAAC supplies mathlib's seeded random generator.
