// @ts-nocheck

/*
 * Adapted from CSTimer by Shuang Chen (cs0x7f), licensed under GPLv3.
 * Copyright (C) 2023 Shuang Chen
 * https://github.com/cs0x7f/cstimer/blob/2547d82e32a347dd1b1c6943e8d03389d03eb64c/src/js/hardware/bluetooth.js
 */

import { $, DEBUG, DEBUGBL, createGiikerUtil } from "./cstimer";
import registerGanCube from "./gancube";
import registerGiikerCube from "./giikercube";
import registerGoCube from "./gocube";
import registerMoyu32Cube from "./moyu32cube";
import registerMoyuCube from "./moyucube";
import registerQiyiCube from "./qiyicube";

export type BluetoothCube = {
  init(reconnect?: boolean): Promise<any>;
  stop(isHardwareEvent?: boolean): Promise<void>;
  isConnected: () => boolean;
  setCallback: (func: any) => void;
  setEventCallback: (func: any) => void;
  getCube: () => any;
  getDeviceName: () => string | undefined;
};

"use strict";

function BtDeviceGroupFactory(giikerutil) {

	/* { prefix: cubeModel } */
	var cubeModels = {};

	function regCubeModel(cubeModel) {
		if ($.isArray(cubeModel.prefix)) {
			cubeModel.prefix.map((prefix) => {
				cubeModels[prefix] = cubeModel;
			});
		} else {
			cubeModels[cubeModel.prefix] = cubeModel;
		}
	}

	var cube = undefined;
	var _device = null;

	function toUuid128(uuid) {
		if (/^[0-9A-Fa-f]{4}$/.exec(uuid)) {
			uuid = "0000" + uuid + "-0000-1000-8000-00805F9B34FB";
		}
		return uuid.toUpperCase();
	}

	function findUUID(elems, uuid) {
		uuid = toUuid128(uuid);
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i]
			if (toUuid128(elem.uuid) == uuid) {
				return elem;
			}
		}
		return null;
	}

	function waitForAdvs() {
		if (!_device || !_device.watchAdvertisements) {
			return Promise.reject(-1);
		}
		// watchAdvertisements() EXISTS on Linux/ChromeOS but never fires
		// 'advertisementreceived' there, so feature-detecting the method isn't enough.
		// Web Bluetooth scanning has known implementation issues on those platforms as
		// of 2026-08; see
		// https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md
		// If support lands there later, this platform skip can simply be removed. Until
		// then, reject early with the existing -1 code so callers fall back to manual
		// MAC entry without waiting out the 10s timeout.
		var uaPlatform = navigator.userAgentData && navigator.userAgentData.platform;
		if (uaPlatform == 'Linux' || uaPlatform == 'Chrome OS') {
			return Promise.reject(-1);
		}
		var abortController = new AbortController();
		return new Promise(function(resolve, reject) {
			var onAdvEvent = function(event) {
				giikerutil.log('[bluetooth] receive adv event', event);
				// Manufacturer data rides in only some advertising packets (e.g. ADV_IND
				// vs SCAN_RSP), and some platforms (Windows/WinRT) deliver them as
				// separate events - so the first event is frequently empty. Ignore
				// packets without manufacturer data and keep listening until one carries
				// it, or until the timeout fires.
				if (!event.manufacturerData || event.manufacturerData.size == 0) {
					giikerutil.log('[bluetooth] adv has no manufacturer data, waiting for next');
					return;
				}
				_device && _device.removeEventListener('advertisementreceived', onAdvEvent);
				abortController.abort();
				resolve(event.manufacturerData);
			};
			_device.addEventListener('advertisementreceived', onAdvEvent);
			_device.watchAdvertisements({ signal: abortController.signal });
			setTimeout(function() { // reject if no mac found
				_device && _device.removeEventListener('advertisementreceived', onAdvEvent);
				abortController.abort();
				reject(-2);
			}, 10000);
		});
	}

	function onHardwareEvent(info, event) {
		var res = Promise.resolve();
		if (info == 'disconnect') {
			res = Promise.resolve(stop(true));
		}
		return res.then(function () {
			return typeof evtCallback == 'function' && evtCallback(info, event);
		});
	}

	var onDisconnect = onHardwareEvent.bind(null, 'disconnect');

	function init(reconnect) {
		return giikerutil.chkAvail().then(function() {
			if (_device && reconnect) {
				giikerutil.log('[bluetooth]', 'reconnecting...', _device);
				return waitUntilDeviceAvailable(_device);
			}
			var filters = Object.keys(cubeModels).map((prefix) => ({ namePrefix: prefix }));
			var opservs = [...new Set(Array.prototype.concat.apply([], Object.values(cubeModels).map((cubeModel) => cubeModel.opservs || [])))];
			var cics = [...new Set(Array.prototype.concat.apply([], Object.values(cubeModels).map((cubeModel) => cubeModel.cics || [])))];
			// also match by advertised service, for devices that can't present a model name (e.g. phone timers)
			var servFilters = [...new Set(Array.prototype.concat.apply([], Object.values(cubeModels).map((cubeModel) => cubeModel.servFilters || [])))];
			filters = filters.concat(servFilters.map((service) => ({ services: [service] })));
			giikerutil.log('[bluetooth]', 'scanning...', Object.keys(cubeModels));
			return window.navigator.bluetooth.requestDevice({
				filters: filters,
				optionalServices: opservs,
				optionalManufacturerData: cics
			});
		}).then(function(device) {
			giikerutil.log('[bluetooth]', 'BLE device is selected, name=' + device.name, device);
			_device = device;
			device.addEventListener('gattserverdisconnected', onDisconnect);
			cube = null;
			var bestPrefix = '';
			for (var prefix in cubeModels) {
				if (device.name && device.name.startsWith(prefix) && prefix.length > bestPrefix.length) {
					bestPrefix = prefix;
					cube = cubeModels[prefix];
				}
			}
			if (cube) {
				return cube.init(device);
			}
			return device.gatt.connect().then((gatt) => gatt.getPrimaryServices()).then(function(servs) {
				var uuids = servs.map((service) => toUuid128(service.uuid));
				cube = Object.values(cubeModels).find((model) => (model.servFilters || []).some((s) => uuids.indexOf(toUuid128(s)) >= 0));
				if (!cube) {
					return Promise.reject('Cannot detect device type');
				}
				return cube.init(device);
			});
		});
	}

	// Wait until target device start sending bluetooth advertisiment packets
	function waitUntilDeviceAvailable(device) {
		var abortController = new AbortController();
		return new Promise(function (resolve, reject) {
			if (!device.watchAdvertisements) {
				reject("Bluetooth Advertisements API is not supported by this browser");
			} else {
				var onAdvEvent = function (event) {
					DEBUG && console.log('[bluetooth] received advertisement packet from device', event);
					delete device.stopWaiting;
					device.removeEventListener('advertisementreceived', onAdvEvent);
					abortController.abort();
					resolve(device);
				};
				device.stopWaiting = function () {
					DEBUG && console.log('[bluetooth] cancel waiting for device advertisements');
					delete device.stopWaiting;
					device.removeEventListener('advertisementreceived', onAdvEvent);
					abortController.abort();
				}
				device.addEventListener('advertisementreceived', onAdvEvent);
				device.watchAdvertisements({ signal: abortController.signal });
				DEBUG && console.log('[bluetooth] start waiting for device advertisement packet');
			}
		});
	}

	function stop(isHardwareEvent) {
		if (!_device) {
			return Promise.resolve();
		}
		return Promise.resolve(cube && cube.clear(isHardwareEvent)).then(function () {
			_device.removeEventListener('gattserverdisconnected', onDisconnect);
			_device.gatt.disconnect();
			_device = null;
		});
	}

	var callback = $.noop;
	var evtCallback = $.noop;

	return {
		init: init,
		stop: stop,
		isConnected: function() {
			return _device != null || DEBUGBL;
		},
		setCallback: function(func) {
			callback = func;
		},
		setEventCallback: function(func) {
			evtCallback = func;
		},
		getCube: function() {
			return cube || (DEBUGBL && {
				getBatteryLevel: function() { return Promise.resolve(80); }
			});
		},
		getDeviceName: function() {
			return _device ? _device.name : undefined;
		},
		regCubeModel: regCubeModel,
		findUUID: findUUID,
		waitForAdvs: waitForAdvs,
		onDisconnect: onDisconnect,
		callback: function() {
			return callback.apply(null, arguments);
		}
	};
}

export function createBluetooth(): BluetoothCube {
  const giikerutil = createGiikerUtil(() => bluetooth.getDeviceName());
  const bluetooth = BtDeviceGroupFactory(giikerutil);
  registerGanCube(bluetooth, giikerutil);
  registerGiikerCube(bluetooth, giikerutil);
  registerGoCube(bluetooth, giikerutil);
  registerMoyu32Cube(bluetooth, giikerutil);
  registerMoyuCube(bluetooth, giikerutil);
  registerQiyiCube(bluetooth, giikerutil);
  const init = bluetooth.init;
  bluetooth.init = function(reconnect) {
    return init(reconnect).catch(async function(error) {
      await bluetooth.stop().catch($.noop);
      throw error;
    });
  };
  return bluetooth;
}
