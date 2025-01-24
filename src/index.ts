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
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
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
            e.id AS employee_id, 
            e.first_name, 
            e.last_name, 
            r.title AS role, 
            d.name AS department, 
            r.salary, 
            COALESCE(m.first_name || ' ' || m.last_name, 'No Manager') AS manager
        FROM employee e
        LEFT JOIN role r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
    `);

    console.table(result.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter the department name:' },
    ]);

    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Added department: ${name}`);
}

async function addRole() {
    const { title, salary, departmentId } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter the role title:' },
        { type: 'input', name: 'salary', message: 'Enter the role salary:' },
        { type: 'input', name: 'departmentId', message: 'Enter the department ID for this role:' },
    ]);

    await pool.query(
        'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
        [title, salary, departmentId]
    );

    console.log(`Added role: ${title}`);
}

async function addEmployee() {
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: "Enter the employee's first name:" },
        { type: 'input', name: 'lastName', message: "Enter the employee's last name:" },
        { type: 'input', name: 'roleId', message: "Enter the employee's role ID:" },
        { type: 'input', name: 'managerId', message: "Enter the manager's ID (or leave blank if none):" },
    ]);

    await pool.query(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [firstName, lastName, roleId, managerId || null]
    );

    console.log(`Added employee: ${firstName} ${lastName}`);
}

async function updateEmployeeRole() {
    const { employeeId, newRoleId } = await inquirer.prompt([
        { type: 'input', name: 'employeeId', message: 'Enter the ID of the employee to update:' },
        { type: 'input', name: 'newRoleId', message: 'Enter the new role ID for the employee:' },
    ]);

    await pool.query(
        'UPDATE employee SET role_id = $1 WHERE id = $2',
        [newRoleId, employeeId]
    );

    console.log(`Updated employee ID ${employeeId} to new role ID ${newRoleId}`);
}

// Start the application
mainMenu();