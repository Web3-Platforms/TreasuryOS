export declare function hashPassword(password: string): {
    salt: string;
    hash: string;
};
export declare function verifyPassword(password: string, salt: string, expectedHash: string): boolean;
