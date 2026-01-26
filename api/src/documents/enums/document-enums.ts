export enum DocumentType {
  CONTRACT = 'contract',
  CONTRACT_ADDENDUM = 'contract_addendum',
  INVOICE = 'invoice',
  RECONCILIATION_ACT = 'reconciliation_act',
  HANDOVER_ACT = 'handover_act',
  CASH_RECEIPT_ORDER = 'cash_receipt_order',
  CASH_EXPENDITURE_ORDER = 'cash_expenditure_order',
  CASH_Z_REPORT = 'cash_z_report',
  LEGAL_DOCUMENTS = 'legal_documents',
  PRODUCTION_FORM = 'production_form',
  DEFECT_INSTALLATION_ACT = 'defect_installation_act',
  WRITE_OFF_ACT = 'write_off_act',
  WAREHOUSE_TRANSFER = 'warehouse_transfer',
  SALES_INVOICE = 'sales_invoice',
  EMPLOYMENT_ORDER = 'employment_order',
  TERMINATION_ORDER = 'termination_order',
  VACATION_ORDER = 'vacation_order',
  BUSINESS_TRIP_ORDER = 'business_trip_order',
  SICK_LEAVE = 'sick_leave',
  PROTOCOL = 'protocol',
  TIMESHEET = 'timesheet',
  WAYBILL_REQUISITION = 'waybill_requisition',
  FINANCIAL_REPORTS = 'financial_reports',
  OTHER = 'other',
}

export enum FileFormat {
  PDF = 'pdf',
  WORD = 'word',
  EXCEL = 'excel',
  OTHER = 'other',
}

export enum Department {
  MILL = 'mill',
  DAIRY = 'dairy',
  SAUSAGE = 'sausage',
  OTHER_SERVICE = 'other_service',
}
