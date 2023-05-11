class Logger {
  private static instance: Logger;

  private debug: boolean = false;

  /**
   * The Logger's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the Logger instance.
   *
   * This implementation let you subclass the Logger class while keeping
   * just one instance of each subclass around.
   */
  public static get Instance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  public setDebug(debug: boolean): void {
    this.debug = debug;
  }

  public log(message?: any, ...optionalParams: any[]): void {
    if (this.debug) {
      if (optionalParams.length) {
        console.log(`[FIK]${message}`, ...optionalParams);
      } else {
        console.log(`[FIK]${message}`);
      }
    }
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    if (this.debug) {
      if (optionalParams.length) {
        console.warn(`[FIK]${message}`, ...optionalParams);
      } else {
        console.warn(`[FIK]${message}`);
      }
    }
  }

  public error(message?: any, ...optionalParams: any[]): void {
    if (this.debug) {
      if (optionalParams.length) {
        console.error(`[FIK]${message}`, ...optionalParams);
      } else {
        console.error(`[FIK]${message}`);
      }
    }
  }
}

export {Logger};
