export interface Media {
    id: string;
    url: string;
    filename: string;
    type: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    title?: string;
    description?: string;
    tags: string[];
    createdAt: string;
    uploader?: {
        name?: string;
        email?: string;
    };
    [key: string]: any;
}
