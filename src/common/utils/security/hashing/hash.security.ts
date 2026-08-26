import { hashSync, compareSync } from "bcrypt";

export const Hash_Function = ({
    plainText,
    saltRounds
}: { plainText: string, saltRounds?: number }) => {
    const salt = saltRounds ?? parseInt(process.env.SALT_ROUNDS ?? '12', 10);
    return hashSync(plainText, salt);
};

export const Compare_Function = ({ plainText, cipherText }: { plainText: string, cipherText: string }) => {
    return compareSync(plainText, cipherText);
};