export class SingleCache {
  private static instance : SingleCache = new SingleCache();

  public ob: Array<any> = [];

  public static getInstance(): SingleCache {
    return this.instance;
  }

  public static setCache(object: Array<any>): void {
    this.instance.ob = object;
  }

  public static getCache(): Array<any> {
    return this.instance.ob;
  }

  private SingleCache() {}
}
