import mondaySdk from "monday-sdk-js";

class MondayClient {
  private static instance: MondayClient;
  private monday = mondaySdk();

  private constructor() {}

  public static getInstance(): MondayClient {
    if (!MondayClient.instance) {
      MondayClient.instance = new MondayClient();
    }
    return MondayClient.instance;
  }

  public setToken(token: string): void {
    this.monday.setToken(token);
  }

  public async makeRequest<T>(query: string): Promise<T> {
    try {
      const response = await this.monday.api(query);
      return response.data as T;
    } catch (error) {
      console.error("Error making Monday.com request:", error);
      throw error;
    }
  }
}

export const mondayClient = MondayClient.getInstance();
