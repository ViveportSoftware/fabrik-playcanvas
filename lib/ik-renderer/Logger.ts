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
  public static getInstance(): Logger {
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
      console.log(`[FIK]${message}`, optionalParams);
    }
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    if (this.debug) {
      console.warn(`[FIK]${message}`, optionalParams);
    }
  }

  public error(message?: any, ...optionalParams: any[]): void {
    if (this.debug) {
      console.error(`[FIK]${message}`, optionalParams);
    }
  }
}

export {Logger};
