class Employee {
    name: string;
    subordinates: Employee[];
    uniqueId: number;
  
    constructor(name: string, uniqueId: number) {
      this.name = name;
      this.subordinates = [];
      this.uniqueId = uniqueId;
    }
  }
  
  class EmployeeOrgApp {
    ceo: Employee | null;
    history: {
      employeeID: number;
      oldSupervisorID: number;
      newSupervisorID: number;
      employeeSubOrdinates?: Employee[];
    }[];
    index: number;
  
    constructor(ceo: Employee) {
      this.ceo = ceo;
      this.history = [];
      this.index = -1;
    }
  
    findEmployeeByID(root: Employee, id: number): Employee | null {
      if (root.uniqueId === id) {
        return root;
      }
  
      for (const subordinate of root.subordinates) {
        const found = this.findEmployeeByID(subordinate, id);
        if (found) {
          return found;
        }
      }
  
      return null;
    }
  
    removeSubordinate(supervisor: Employee, subordinateID: number): void {
      supervisor.subordinates = supervisor.subordinates.filter(
        (subordinate) => subordinate.uniqueId !== subordinateID
      );
    }
  
    addSubordinate(
      supervisor: Employee,
      subordinate: Employee,
      employeeSubOrdinates?: Employee[]
    ): void {
      if (employeeSubOrdinates) {
        subordinate.subordinates = employeeSubOrdinates;
        supervisor.subordinates = supervisor.subordinates.filter(
          (subOrd) =>
            !employeeSubOrdinates.some((emp) => emp.uniqueId === subOrd.uniqueId)
        );
      }
      supervisor.subordinates.push(subordinate);
    }
  
    move(employeeID: number, supervisorID: number): void {
      const employee = this.findEmployeeByID(this.ceo!, employeeID);
      const newSupervisor = this.findEmployeeByID(this.ceo!, supervisorID);
  
      let employeeSubOrdinates = employee?.subordinates;
  
      if (!employee || !newSupervisor) {
        return;
      }
  
      const oldSupervisor = this.findEmployeeParent(this.ceo!, employeeID);
      employeeSubOrdinates?.length &&
        oldSupervisor!.subordinates.push(...employeeSubOrdinates);
  
      employee.subordinates = [];
  
      if (oldSupervisor) {
        this.removeSubordinate(oldSupervisor, employeeID);
      }
  
      this.history.splice(this.index + 1);
      this.history.push({
        employeeID,
        oldSupervisorID: oldSupervisor?.uniqueId || -1,
        newSupervisorID: newSupervisor.uniqueId,
        employeeSubOrdinates,
      });
      this.index++;
  
      this.addSubordinate(newSupervisor, employee);
    }
  
    findEmployeeParent(root: Employee, id: number): Employee | null {
      for (const subordinate of root.subordinates) {
        if (subordinate.subordinates.some((sub) => sub.uniqueId === id)) {
          return subordinate;
        }
  
        const parent = this.findEmployeeParent(subordinate, id);
        if (parent) {
          return parent;
        }
      }
  
      return null;
    }
  
    undo(): void {
      if (this.index >= 0) {
        const {
          employeeID,
          oldSupervisorID,
          newSupervisorID,
          employeeSubOrdinates,
        } = this.history[this.index];
        const employee = this.findEmployeeByID(this.ceo!, employeeID)!;
        const oldSupervisor = this.findEmployeeByID(this.ceo!, oldSupervisorID);
        const newSupervisor = this.findEmployeeByID(this.ceo!, newSupervisorID);
  
        if (employee && newSupervisor) {
          this.removeSubordinate(newSupervisor, employeeID);
        }
  
        if (employee && oldSupervisor) {
          this.addSubordinate(oldSupervisor, employee, employeeSubOrdinates);
        }
  
        this.index--;
      }
    }
  
    redo(): void {
      if (this.index < this.history.length - 1) {
        this.index++;
        const {
          employeeID,
          oldSupervisorID,
          newSupervisorID,
        } = this.history[this.index];
        const employee = this.findEmployeeByID(this.ceo!, employeeID)!;
        const oldSupervisor = this.findEmployeeByID(this.ceo!, oldSupervisorID);
        const newSupervisor = this.findEmployeeByID(this.ceo!, newSupervisorID);
  
        employee.subordinates = [];
  
        if (employee && oldSupervisor) {
          this.removeSubordinate(oldSupervisor, employeeID);
        }
  
        if (employee && newSupervisor) {
          this.addSubordinate(newSupervisor, employee);
        }
      }
    }
  
    addEmployee(
      employeeName: string,
      employeeID: number,
      supervisorID: number
    ): Employee | null {
      const empNode = new Employee(employeeName, employeeID);
      if (!this.ceo) {
        this.ceo = empNode;
        return this.ceo;
      }
      const seniorEmp = this.findEmployeeByID(this.ceo!, supervisorID);
      if (seniorEmp) {
        seniorEmp.subordinates?.push(empNode);
      }
      return seniorEmp;
    }
  }
  
  const ceo: Employee = {
    uniqueId: 1,
    name: "John Smith",
    subordinates: [],
  };
  
  const app = new EmployeeOrgApp(ceo);
  
  app.addEmployee("shikha", 2, 1);
  app.addEmployee("sakshi", 3, 1);
  app.addEmployee("keshav", 4, 3);
  app.addEmployee("nikita", 5, 3);
  app.addEmployee("paras", 6, 2);
  app.addEmployee("kirti", 7, 2);
  app.addEmployee("pyare", 8, 7);
  app.addEmployee("shalini", 9, 7);
  app.addEmployee("A", 10, 5);
  app.addEmployee("B", 11, 5);
  app.addEmployee("C", 12, 5);
  app.addEmployee("kavita", 13, 11);
  app.addEmployee("shyam", 14, 11);
  app.move(11, 6);
  app.undo();
  app.redo();
  console.log(app,"app")