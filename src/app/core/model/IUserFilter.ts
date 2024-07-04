export interface IUserFilter {
  global?: string,
  name?: string,
  firstName?: string,
  lastName?: string,
  username?: string,
  role?: string,
  email?: string,
  isActive: string,
  isNotLocked: string
  page: number,
  itemsPerPage: number,
  sort: string,
}