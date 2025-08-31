export class BadgeNotFoundError extends Error {
    constructor(message: string = "Badge not found") {
        super(message);
        this.name = "BadgeNotFoundError";
    }
}