USE employee_db;

INSERT INTO departments (name)
VALUES ("IT"),
       ("Sales");

INSERT INTO roles (title, salary, department_id)
VALUES  ("Web dev", 100, 1),
        ("soft dev", 300, 2);

INSERT INTO employees (first_name, last_name, role_id, manager_id) 
VALUES  ("Jane", "Doe", 1, 1),
        ("Syd", "B", 2, 1)
       