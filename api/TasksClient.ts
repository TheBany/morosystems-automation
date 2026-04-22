import { APIRequestContext, APIResponse } from '@playwright/test';
import type { CreateTask, UpdateTask } from './generated';

/**
 * Wrapper around Playwright's APIRequestContext that provides
 * typed methods for the todo-be API. Types come from the
 * auto-generated @hey-api/openapi-ts client (./generated).
 */
export class TasksClient {
  constructor(private readonly request: APIRequestContext) {}

  async getAll(): Promise<APIResponse> {
    return this.request.get('/tasks');
  }

  async getCompleted(): Promise<APIResponse> {
    return this.request.get('/tasks/completed');
  }

  async create(data: CreateTask): Promise<APIResponse> {
    return this.request.post('/tasks', { data });
  }

  async update(id: string, data: UpdateTask): Promise<APIResponse> {
    return this.request.post(`/tasks/${id}`, { data });
  }

  async delete(id: string): Promise<APIResponse> {
    return this.request.delete(`/tasks/${id}`);
  }
}