import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}

  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return await lastValueFrom(this.httpService.get<T>(url, config));
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return await lastValueFrom(this.httpService.post<T>(url, data, config));
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return await lastValueFrom(this.httpService.put<T>(url, data, config));
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return await lastValueFrom(this.httpService.patch<T>(url, data, config));
  }

  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return await lastValueFrom(this.httpService.delete<T>(url, config));
  }
}
