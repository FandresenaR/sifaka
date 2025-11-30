declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    CLIENT = "CLIENT"
}
export declare class UpdateUserDto {
    name?: string;
    avatar?: string;
    role?: UserRole;
}
export {};
