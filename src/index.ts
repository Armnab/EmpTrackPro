import inquirer from 'inquirer';
import pool from './connection';

async function mainMenu() {
    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Exit',
            ],
        },
    ]);

    switch (choice) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Exit':
            console.log('Goodbye!');
            process.exit();
    }

    mainMenu();
}

async function viewDepartments() {
    const result = await pool.query('SELECT * FROM department');
    console.table(result.rows);
}

async function viewRoles() {
    const result = await pool.query(`
        SELECT role.id, role.title, role.salary, department.name AS department 
        FROM role 
        INNER JOIN department ON role.department_id = department.id
    `);
    console.table(result.rows);
}

async function viewEmployees() {
    const result = await pool.query(`
        SELECT 
            employee.id, employee.first_name, employee.last_name, 
            role.title, department.name AS department, role.salary
        FROM employee 
        INNER JOIN role ON employee.role_id = role.id
        INNER JOIN department ON role.department_id = department.id
    `);
    console.table(result.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter department name:' },
    ]);
    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Added ${name} to departments.`);
}

mainMenu();