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
                'Update an employee role',
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
            pool.end();
            process.exit();
    }

    mainMenu();
}

async function viewDepartments() {
    const result = await pool.query('SELECT * FROM department');
    console.table(result.rows);
}

async function viewRoles() {
    const result = await pool.query('SELECT * FROM role');
    console.table(result.rows);
}

async function viewEmployees() {
    const result = await pool.query('SELECT * FROM employee');
    console.table(result.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter the department name:' },
    ]);

    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Added department: ${name}`);
}

mainMenu();