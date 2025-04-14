export interface IUserFilter {
  searchParam?: string,
  email?: string,
  fullName?: string,
  role?: string,
  userType?: string,
  isActive?: string,
  isNotLocked?: string
  page: number,
  itemsPerPage: number,
  sort: string,
}