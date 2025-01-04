export const DEMO_USER = {
  id: "demo-user",
  email: "demo@clicksetgo.app",
  name: "Demo User",
  isDemo: true
};

export const isDemoUser = (email: string) => email === DEMO_USER.email;