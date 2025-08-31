export type MediaType = "image" | "video" | "audio" | "document";

export type Media = {
    url: string;
    type: MediaType;
}