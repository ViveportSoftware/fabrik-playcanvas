declare class Logger {
    private static instance;
    private debug;
    /**
     * The Logger's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor();
    /**
     * The static method that controls the access to the Logger instance.
     *
     * This implementation let you subclass the Logger class while keeping
     * just one instance of each subclass around.
     */
    static get Instance(): Logger;
    setDebug(debug: boolean): void;
    log(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}
export { Logger };
