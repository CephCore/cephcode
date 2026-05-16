declare module 'node-pty' {
  export interface IPty extends Writable {
    /**
     * The PID of the shell process.
     */
    pid: number;

    /**
     * The column size (in characters).
     */
    cols: number;

    /**
     * The row size (in characters).
     */
    rows: number;

    /**
     * The underlying shell process' environment variables.
     */
    process: string;

    /**
     * Resizes the PTY.
     * @param cols - The number of columns.
     * @param rows - The number of rows.
     */
    resize(cols: number, rows: number): void;

    /**
     * Kills the PTY.
     */
    kill(signal?: string): void;

    /**
     * Event: Data is emitted from the shell.
     */
    onData(callback: (data: string) => void): void;

    /**
     * Event: The PTY exits.
     */
    onExit(callback: (exitData: { exitCode: number; signal: string }) => void): void;
  }

  export interface SpawnOptions {
    /**
     * The name of the file being spawned.
     */
    name: string;

    /**
     * The file path of the program to execute.
     */
    cwd: string;

    /**
     * Environment variables.
     */
    env: { [key: string]: string };

    /**
     * Whether to enable flow control.
     */
    handleFlowControl?: boolean;

    /**
     * Columns.
     */
    cols?: number;

    /**
     * Rows.
     */
    rows?: number;
  }

  /**
   * Spawns a new process.
   * @param file - The file to spawn.
   * @param args - The arguments.
   * @param options - The options.
   * @returns The interactive PTY.
   */
  export function spawn(file: string, args: string[], options?: Partial<SpawnOptions>): IPty;

  /**
   * Gets the terminal environment.
   * @returns The terminal environment.
   */
  export function getEnv(): { [key: string]: string };

  /**
   * Gets the default shell.
   * @platformposix - The default shell on POSIX.
   * @platformwin32 - The default shell on Windows.
   * @returns The default shell.
   */
  export function getDefaultShell(platform?: 'posix' | 'win32' | 'darwin'): string;
}
