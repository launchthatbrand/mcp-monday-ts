declare class MondayClient {
    private static instance;
    private monday;
    private constructor();
    static getInstance(): MondayClient;
    setToken(token: string): void;
    makeRequest<T>(query: string): Promise<T>;
}
export declare const mondayClient: MondayClient;
export {};
