export enum Status {
  Absent, // The item is not in the registry.
  Registered, // The item is in the registry.
  RegistrationRequested, // The item has a request to be added to the registry.
  ClearingRequested, // The item has a request to be removed from the registry.
}

export enum RecipientType {
  None,
  ExternalAccount,
  FlowContract,
}

export enum DisputeStatus {
  Waiting,
  Appealable,
  Solved,
}
