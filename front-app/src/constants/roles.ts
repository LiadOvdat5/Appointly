// Mirror backend WebAPI.Models.UserRole (client, partner, owner, admin) and add Guest for unauthenticated users.
export const Role = {
  Guest: -1,
  Client: 0, // matches UserRole.client
  Partner: 1, // matches UserRole.partner
  Owner: 2,  // matches UserRole.owner
  Admin: 3,  // matches UserRole.admin
} as const;

export type Role = (typeof Role)[keyof typeof Role];
