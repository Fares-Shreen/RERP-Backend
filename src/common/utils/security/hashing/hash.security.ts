import { hashSync, compareSync } from "bcrypt";

export const hash = ({
    plainText,
    saltRounds
}: { plainText: string, saltRounds?: number }) => {
    const salt = saltRounds ?? parseInt(process.env.SALT_ROUNDS ?? '12', 10);
    return hashSync(plainText, salt);
};

export const compare = ({ plainText, cipherText }: { plainText: string, cipherText: string }) => {
    return compareSync(plainText, cipherText);
};