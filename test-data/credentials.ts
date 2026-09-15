/** A fresh, never-before-used email for registration tests — each run needs a unique one. */
export function uniqueTestEmail(label: string): string {
  return `kristest2233+${label}${Date.now()}@gmail.com`;
}

export const users = {
  student: {
    email: "kristest2233+student@gmail.com",
    password: "Testparola*",
  },
  parent: {
    email: "kristest2233+parent@gmail.com",
    password: "Testparola*",
  },
  teacher: {
    email: "kristest2233+teacher@gmail.com",
    password: "Testparola*",
  },
};
