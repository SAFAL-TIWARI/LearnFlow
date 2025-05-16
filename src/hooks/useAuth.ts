import { useAuth as useSupabaseAuth } from '../context/SupabaseAuthContext';

// Re-export the useAuth hook from the context
export const useAuth = useSupabaseAuth;

export default useAuth;