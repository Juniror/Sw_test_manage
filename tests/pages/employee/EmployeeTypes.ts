export interface EmployeeData {
  firstName: string;
  lastName?: string;
  nickname?: string;
  position?: string;
  phone?: string;
  nationalId?: string;
  skills?: string;
  dailyWage?: string;
  hireDate?: string;
  status?: string;
  assignedSite?: string;
  // Extra fields for Edit mode
  workerId?: string;
  employeeCode?: string;
  emergencyContact?: string;
  address?: string;
  notes?: string;
}
