export interface Team {
  id: string;
  slug: string;
  displayName: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  teamSlug: string;
  teamName: string;
}
