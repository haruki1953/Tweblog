export interface UserJwtPayload {
  payloadStr: string
  exp: number
}

export interface UserJwtVariables {
  jwtPayload: UserJwtPayload
  [key: string]: any // Hono's requirements
}
