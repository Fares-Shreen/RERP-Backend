import { SetMetadata } from "@nestjs/common";
import { employee_role_Enum } from "src/common/enums/employee.enum";
import { tokenEnum } from "src/common/enums/token.enum";
// import { roleEnum } from "src/common/enums/user.enum";


export const TOKEN_TYPE_KEY = "tokentype"
export const ACCESS_ROLES_KEY = "accesroles"

export const tokenTypeDecorator = (tokenType: tokenEnum = tokenEnum.accessToken) => {
    return SetMetadata(TOKEN_TYPE_KEY, tokenType);
};
export const Roles = (access_roles: employee_role_Enum[]) => {
    return SetMetadata(ACCESS_ROLES_KEY, access_roles)
}