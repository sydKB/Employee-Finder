USE employee_db;

INSERT INTO departments (name)
VALUES ("IT"),
       ("Sales");

INSERT INTO roles (title, salary, department_id)
VALUES  ("Web dev", 90000, 1),
        ("soft dev", 100000, 1),
        ("external sales", 80000, 2);

INSERT INTO employees (first_name, last_name, role_id, manager_id) 
VALUES  ("Jane", "Doe", 3, 2),
        ("Syd", "B", 1, 1);
       