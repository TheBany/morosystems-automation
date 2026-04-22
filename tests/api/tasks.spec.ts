import { test, expect } from '@playwright/test';
import { TasksClient } from '../../api/TasksClient';
import type { Task } from '../../api/generated';

test.describe('Tasks API', () => {
  let tasks: TasksClient;
  let createdTaskId: string | null = null;

  test.beforeEach(async ({ request }) => {
    tasks = new TasksClient(request);
  });

  test.afterEach(async () => {
    // Cleanup — ensure test isolation by deleting any task we created
    if (createdTaskId) {
      await tasks.delete(createdTaskId);
      createdTaskId = null;
    }
  });

  // --- CRUD operations (required by assignment) ---

  test('GET /tasks returns an array of tasks', async () => {
    const response = await tasks.getAll();

    expect(response.status()).toBe(200);
    const body = await response.json() as Task[];
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /tasks creates a new task', async () => {
    const response = await tasks.create({ text: 'Write API tests' });

    expect(response.status()).toBe(200);
    const task = await response.json() as Task;

    expect(task).toMatchObject({
      text: 'Write API tests',
      completed: false,
    });
    expect(task.id).toBeTruthy();
    expect(typeof task.createdDate).toBe('number');

    createdTaskId = task.id;
  });

  test('POST /tasks/{id} updates task text', async () => {
    // Arrange
    const createResponse = await tasks.create({ text: 'Original text' });
    const created = await createResponse.json() as Task;
    createdTaskId = created.id;

    // Act
    const updateResponse = await tasks.update(created.id, { text: 'Updated text' });

    // Assert
    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json() as Task;
    expect(updated.id).toBe(created.id);
    expect(updated.text).toBe('Updated text');
  });

  test('DELETE /tasks/{id} removes a task', async () => {
    // Arrange
    const createResponse = await tasks.create({ text: 'To be deleted' });
    const created = await createResponse.json() as Task;

    // Act
    const deleteResponse = await tasks.delete(created.id);

    // Assert — deletion succeeded
    expect(deleteResponse.status()).toBe(200);

    // Verify it's actually gone from the list
    const listResponse = await tasks.getAll();
    const allTasks = await listResponse.json() as Task[];
    expect(allTasks.find(t => t.id === created.id)).toBeUndefined();

    // No cleanup needed — task is already deleted
    createdTaskId = null;
  });

  // --- Additional coverage ---

  test('GET /tasks/completed returns an array of completed tasks', async () => {
    const response = await tasks.getCompleted();

    expect(response.status()).toBe(200);
    const completedTasks = await response.json() as Task[];
    expect(Array.isArray(completedTasks)).toBe(true);

    // Filter contract: every task in the response must be marked as completed
    expect(completedTasks.every(t => t.completed)).toBe(true);
  });

  // --- Negative tests: input validation ---

  test('POST /tasks with empty text returns 422', async () => {
    const response = await tasks.create({ text: '' });
    expect(response.status()).toBe(422);
  });

  test('POST /tasks/{id} with non-existent id returns error', async () => {
    const response = await tasks.update('non-existent-id', { text: 'Any text' });
    expect([400, 404, 422]).toContain(response.status());
  });

  test('DELETE /tasks/{id} with non-existent id returns error', async () => {
    const response = await tasks.delete('non-existent-id');
    expect([400, 404]).toContain(response.status());
  });
});