export abstract class StorageService {
    abstract upload(path: string): Promise<{ id: string }>;

    abstract getPublicUrl(id: string): string | Promise<string>;
}
