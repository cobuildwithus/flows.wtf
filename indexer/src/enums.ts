export enum RecipientType {
  None,
  ExternalAccount,
  FlowContract,
}

export enum Status {
  Absent, // The item is not in the registry.
  Registered, // The item is in the registry.
  RegistrationRequested, // The item has a request to be added to the registry.
  ClearingRequested, // The item has a request to be removed from the registry.
}

export enum DisputeStatus {
  Waiting,
  Appealable,
  Solved,
}

export enum Party {
  None, // Party per default when there is no challenger or requester. Also used for inconclusive ruling.
  Requester, // Party that made the request to change a status.
  Challenger, // Party that challenges the request to change a status.
}
