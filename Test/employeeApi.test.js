import axios from 'axios';
import { faker } from '@faker-js/faker';
import employeeApiClient from '../ApiClient/employeeApiClient';

describe('Employee Catalog API Tests', () => {
  let validToken;
  let testEmployeeId;

  // Log in once before all tests to retrieve a valid token.
  beforeAll(async () => {
    const res = await employeeApiClient.login('admin10', 'securePassword');
    expect(res.status).toBe(200);
    validToken = res.data.token;
    expect(validToken).toBeDefined();
  });

  describe('Authentication Tests', () => {
    test('Should return unauthorized for a wrong token', async () => {
      try {
        await employeeApiClient.getEmployees('wrongToken');
      } catch (error) {
        // API returns 403 for invalid tokens.
        expect(error.response.status).toBe(403);
      }
    });

    test('Should return unauthorized when no token is provided', async () => {
      try {
        // Direct request without any Authorization header.
        await axios.get('/employees', {
          baseURL: 'https://apisforemployeecatalogmanagementsystem.onrender.com',
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Employee Tests', () => {
    // Function to generate random employee data using the new Faker API.
    const generateRandomEmployeeData = () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.past({ years: 30, refDate: new Date('2000-01-01') })
        .toISOString()
        .split('T')[0],
      contactInfo: {
        email: faker.internet.email(),
        phone: faker.phone.number('+###########'),
        address: {
          street: faker.location.streetAddress(),
          town: faker.location.city(),
          postCode: faker.location.zipCode(),
        },
      },
    });

    // Create an employee before each test that needs an existing employee.
    beforeEach(async () => {
      const employeeData = generateRandomEmployeeData();
      const res = await employeeApiClient.createEmployee(validToken, employeeData);
      expect(res.status).toBe(201);
      testEmployeeId = res.data.employeeId;
    });

    // Clean up after each test by deleting the employee if it exists.
    afterEach(async () => {
      try {
        await employeeApiClient.deleteEmployee(validToken, testEmployeeId);
      } catch (error) {
        // If already deleted, ignore the error.
      }
    });

    test('Should create a new employee and verify the details', async () => {
      const employeeData = generateRandomEmployeeData();
      const createRes = await employeeApiClient.createEmployee(validToken, employeeData);
      expect(createRes.status).toBe(201);
      expect(createRes.data.message).toEqual('Employee created successfully!');
      const employeeId = createRes.data.employeeId;

      // Verify employee details using GET.
      const getRes = await employeeApiClient.getEmployeeById(validToken, employeeId);
      expect(getRes.status).toBe(200);
      expect(getRes.data.firstName).toEqual(employeeData.firstName);

      // Clean up: Delete the newly created employee.
      await employeeApiClient.deleteEmployee(validToken, employeeId);
    });

    test('Should update an existing employee', async () => {
      const updatedData = generateRandomEmployeeData();
      const updateRes = await employeeApiClient.updateEmployee(validToken, testEmployeeId, updatedData);
      expect(updateRes.status).toBe(200);
      
      // Verify the update with a subsequent GET request.
      const getRes = await employeeApiClient.getEmployeeById(validToken, testEmployeeId);
      expect(getRes.status).toBe(200);
      expect(getRes.data.firstName).toEqual(updatedData.firstName);
    });

    test('Should delete an employee and verify deletion', async () => {
      // Delete the employee created in beforeEach.
      const deleteRes = await employeeApiClient.deleteEmployee(validToken, testEmployeeId);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.data.message).toEqual('Employee deleted successfully!');

      // Confirm deletion by verifying a 404 response when retrieving the employee.
      try {
        await employeeApiClient.getEmployeeById(validToken, testEmployeeId);
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toEqual('Employee not found');
      }
    });

    test('Should retrieve all employees and include the newly created one', async () => {
      // Retrieve all employees.
      const res = await employeeApiClient.getEmployees(validToken);
      expect(res.status).toBe(200);
      
      const employees = res.data;
      const found = employees.some((emp) => emp.employeeId === testEmployeeId);
      expect(found).toBeTruthy();
    });
  });
});
