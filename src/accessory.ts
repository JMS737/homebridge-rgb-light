import Axios from "axios";
import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from "homebridge";

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory("RGB-Light", RgbLight);
};

class RgbLight implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly name: string;
  private readonly infoUrl: string;
  private readonly stateUrl: string;
  private readonly brightnessUrl: string;
  private readonly colourUrl: string;

  private brightness: number;
  private hue: number;
  private saturation: number;

  private readonly lightService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;

    this.brightness = 100;
    this.hue = 0;
    this.saturation = 0;

    this.infoUrl = config.infoUrl;
    this.stateUrl = config.stateUrl;
    this.brightnessUrl = config.brightnessUrl;
    this.colourUrl = config.colourUrl;

    this.lightService = new hap.Service.Lightbulb(this.name);
    this.lightService.getCharacteristic(hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, this.handleOnGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleOnSet.bind(this));

    if (this.brightnessUrl) {
      this.lightService.getCharacteristic(hap.Characteristic.Brightness)
        .on(CharacteristicEventTypes.GET, this.handleBrightnessGet.bind(this))
        .on(CharacteristicEventTypes.SET, this.handleBrightnessSet.bind(this));
    }

    if (this.colourUrl) {
      this.lightService.getCharacteristic(hap.Characteristic.Hue)
        .on(CharacteristicEventTypes.GET, this.handleHueGet.bind(this))
        .on(CharacteristicEventTypes.SET, this.handleHueSet.bind(this));

      this.lightService.getCharacteristic(hap.Characteristic.Saturation)
        .on(CharacteristicEventTypes.GET, this.handleSaturationGet.bind(this))
        .on(CharacteristicEventTypes.SET, this.handleSaturationSet.bind(this));
    }

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "777 Productions")
      .setCharacteristic(hap.Characteristic.Model, "Raspberry Pi - RGB LED Strip");
  }

  handleOnGet(callback: CharacteristicGetCallback): void {
    Axios.get(this.infoUrl)
      .then((response) => {
        let deviceInfo = response.data.device;
        let state = deviceInfo.state;
        this.log.debug("Current state of the light was returned: " + (state ? "ON" : "OFF"));
        callback(undefined, state);
      })
      .catch((error) => {
        this.log.error(`Failed to get on/off state. ${error}`);
        callback(error);
      });
  }

  handleOnSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    Axios.put(this.stateUrl, {
      state: value
    })
      .then((response) => {
        this.log.debug(`Light state was set to: ${value as boolean ? "ON" : "OFF"}`);
        callback();
      })
      .catch((error) => {
        this.log.error(`Failed to turn light ${value as boolean ? "ON" : "OFF"}. ${error}`);
        callback(error);
      });
  }

  handleBrightnessGet(callback: CharacteristicGetCallback): void {
    Axios.get(this.infoUrl)
      .then((response) => {
        let deviceInfo = response.data.device;
        this.brightness = deviceInfo.brightness;
        this.log.debug(`Current brightness returned: ${this.brightness}%`);
        callback(undefined, this.brightness);
      })
      .catch((error) => {
        this.log.error(`Failed to get brightness. ${error}`);
        callback(error);
      })
  }

  handleBrightnessSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    Axios.put(this.brightnessUrl, { brightness: (value as number) })
      .then((response) => {
        this.log.debug(`Light brighness was set to: ${value as number}`);
        callback();
      })
      .catch((error) => {
        this.log.error(`Failed to set brightness. ${error}`);
      });
  }

  handleHueGet(callback: CharacteristicGetCallback): void {
    Axios.get(this.infoUrl)
      .then((response) => {
        let deviceInfo = response.data.device;
        let hsv = deviceInfo.hsv;
        this.hue = hsv.h;
        this.saturation = hsv.s;

        this.log.debug(`Current HSV: ${this.hue}, ${this.saturation}`);
        callback(undefined, this.hue);
      })
      .catch((error) => {
        this.log.error(`Failed to get hue. ${error}`);
        callback(error);
      });
  }

  handleHueSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    this.hue = value as number;
    let hsv = { h: this.hue, s: this.saturation, v: 100 };

    Axios.put(this.colourUrl, { hsv: hsv })
      .then((response) => {
        this.log.debug(`Light colour was set to: ${hsv}`);
        callback();
      })
      .catch((error) => {
        this.log.error(`Failed to set hue. ${error}`);
      });
  }

  handleSaturationGet(callback: CharacteristicGetCallback): void {
    Axios.get(this.infoUrl)
      .then((response) => {
        let deviceInfo = response.data.device;
        let hsv = deviceInfo.hsv;
        this.hue = hsv.h;
        this.saturation = hsv.s;

        this.log.debug(`Current HSV: ${this.hue}, ${this.saturation}`);
        callback(undefined, this.saturation);
      })
      .catch((error) => {
        this.log.error(`Failed to get saturation. ${error}`);
        callback(error);
      });
  }

  handleSaturationSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    this.saturation = value as number;
    let hsv = { h: this.hue, s: this.saturation, v: 100 };
    
    Axios.put(this.colourUrl, { hsv: hsv })
      .then((response) => {
        this.log.debug(`Light colour was set to: ${hsv}`);
        callback();
      })
      .catch((error) => {
        this.log.error(`Failed to set saturation. ${error}`);
      });
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  // identify(): void {
  //   this.log("Identify!");
  // }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.lightService,
    ];
  }

}
