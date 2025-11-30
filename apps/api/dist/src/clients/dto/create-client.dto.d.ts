import { ClientStatus } from '../../generated/client';
export declare class CreateClientDto {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    address?: string;
    city?: string;
    country?: string;
    website?: string;
    notes?: string;
    status?: ClientStatus;
    projectId?: string;
}
