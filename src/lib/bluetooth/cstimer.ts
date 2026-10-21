// Minimal replacements for the CSTimer browser/UI helpers used by the cube drivers.
import aes128 from "./aes128";

export const DEBUG = false;
export const DEBUGBL = false;

const delayed = new Map<string, ReturnType<typeof setTimeout>>();

export const $ = {
  aes128,
  isArray: Array.isArray,
  now: Date.now,
  noop: () => undefined,
  delayExec(key: string, func: () => void, timeout: number) {
    clearTimeout(delayed.get(key));
    delayed.set(key, setTimeout(() => {
      delayed.delete(key);
      func();
    }, timeout));
  },
};

// The trainer uses the cube's actual facelets; CSTimer's solved-state reset UI
// and battery display are not part of this app.
export const kernel = {
  getProp(_key: string, fallback?: string) {
    return fallback;
  },
};
// English messages from CSTimer's src/lang/en-us.js.
export const CONFIRM_GIIRST = "Reset bluetooth cube as solved?";
export const LGHINT_BTNOTSUP = "Not support your smart cube";
const LGHINT_BTINVMAC = "Not a valid mac address, cannot connect to your smart cube";
const GIIKER_REQMACMSG = "Please enter the MAC address of your smart hardware (xx:xx:xx:xx:xx:xx). You can find the MAC address through chrome://bluetooth-internals/#devices, or modify following options to let csTimer automatically obtain it:\nChrome: Turn on chrome://flags/#enable-experimental-web-platform-features\nBluefy: Turn on Enable BLE Advertisements";
const GIIKER_NOBLEMSG = "Bluetooth API is not available. Ensure https access, check bluetooth is enabled on your device, and try chrome with chrome://flags/#enable-experimental-web-platform-features enabled";
export const logohint = {
  push(message: string) {
    window.alert(message);
    if (message === LGHINT_BTNOTSUP) {
      throw new Error(message);
    }
  },
};

export function createGiikerUtil(getDeviceName: () => string | undefined) {
  return {
    log: (...args: any[]) => { DEBUG && console.log(...args); },
    markSolved: $.noop,
    updateBattery: $.noop,
    chkAvail() {
      if (!window.navigator?.bluetooth) {
        window.alert(GIIKER_NOBLEMSG);
        return Promise.reject(new Error(GIIKER_NOBLEMSG));
      }
      const bluetooth = window.navigator.bluetooth;
      return (bluetooth.getAvailability ? bluetooth.getAvailability() : Promise.resolve(true))
        .then((available: boolean) => {
          if (!available) {
            window.alert(GIIKER_NOBLEMSG);
            throw new Error(GIIKER_NOBLEMSG);
          }
        });
    },
    // Adapted from src/js/tools/bluetoothutil.js; retain this app's macMap key.
    reqMacAddr(forcePrompt: boolean, isWrongKey: boolean, deviceMac?: string, defaultMac?: string) {
      const deviceName = getDeviceName();
      const savedMacMap = JSON.parse(localStorage.getItem("macMap") || "{}");
      let mac = savedMacMap[deviceName];
      if (deviceMac) {
        if (!mac || mac.toUpperCase() !== deviceMac.toUpperCase()) {
          mac = deviceMac;
        }
      } else {
        if (!mac || forcePrompt) {
          // Explicit line breaks prevent text selection in Chromium's native dialogs.
          mac = window.prompt(
            ((isWrongKey ? "The MAC provided might be wrong!\n" : "") + GIIKER_REQMACMSG).replace(/[\r\n]+/g, " "),
            mac || defaultMac || "xx:xx:xx:xx:xx:xx",
          );
        }
        if (!/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(mac)) {
          logohint.push(LGHINT_BTINVMAC);
          throw new Error(LGHINT_BTINVMAC);
        }
      }
      if (mac !== savedMacMap[deviceName]) {
        savedMacMap[deviceName] = mac;
        localStorage.setItem("macMap", JSON.stringify(savedMacMap));
      }
      return mac;
    },
  };
}
