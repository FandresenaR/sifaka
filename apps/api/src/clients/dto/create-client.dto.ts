import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { ClientStatus } from '../../generated/client';

export class CreateClientDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsEnum(ClientStatus)
    @IsOptional()
    status?: ClientStatus;

    @IsOptional()
    @IsString()
    projectId?: string;
}
