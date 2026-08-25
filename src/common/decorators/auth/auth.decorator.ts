import { SetMetadata } from "@nestjs/common";
import { tokenEnum } from "src/common/enums/token.enum";
import { roleEnum } from "src/common/enums/user.enum";


export const TOKEN_TYPE_KEY = "tokentype"
export const ACCESS_ROLES_KEY = "accesroles"

export const tokenTypeDecorator = (tokenType: tokenEnum = tokenEnum.accessToken) => {
    return SetMetadata(TOKEN_TYPE_KEY, tokenType);
};
export const Roles = (access_roles: roleEnum[]) => {
    return SetMetadata(ACCESS_ROLES_KEY, access_roles)
}