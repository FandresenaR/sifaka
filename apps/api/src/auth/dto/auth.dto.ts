import { IsString, IsEmail, IsOptional } from "class-validator";

export class GoogleAuthDto {
  @IsString()
  idToken: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: string;
  };
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
