import { test, expect } from '@playwright/test';

const TEST_USER_EMAIL = 'root@local';
const TEST_USER_PASSWORD = 'rootpass';

const login = async (page) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(TEST_USER_EMAIL);
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(TEST_USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('button', { name: '+ Nueva Tarea' })).toBeVisible();
};

test.describe('Frontend tareas app', () => {
  test('crea una nueva tarea', async ({ page }) => {
    const taskTitle = `E2E crear tarea ${Date.now()}`;
    await login(page);

    await page.getByRole('button', { name: '+ Nueva Tarea' }).click();
    await page.getByLabel('Nombre de la tarea').fill(taskTitle);
    await page.getByLabel('Descripción').fill('Prueba de creación de tarea con Playwright');
    await page.getByRole('button', { name: 'Crear Tarea', exact: true }).click();

    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('busca tarea por nombre', async ({ page }) => {
    const taskTitle = `E2E buscar tarea ${Date.now()}`;
    await login(page);

    await page.getByRole('button', { name: '+ Nueva Tarea' }).click();
    await page.getByLabel('Nombre de la tarea').fill(taskTitle);
    await page.getByLabel('Descripción').fill('Prueba de búsqueda por nombre');
    await page.getByRole('button', { name: 'Crear Tarea', exact: true }).click();

    await page.getByRole('textbox', { name: 'Buscar por nombre' }).fill(taskTitle);
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();

    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('filtra tareas por tag', async ({ page }) => {
    await login(page);

    await page.getByRole('combobox', { name: 'Filtrar por etiqueta' }).click({ force: true });
    await page.getByRole('option', { name: 'Urgente' }).click();
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();

    await expect(page.getByText('Aprender Sequelize')).toBeVisible();
  });
});