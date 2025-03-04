import { useAuth } from '../contexts/AuthContext';

export interface Permissions {
  // Session management permissions
  canCreateUnlimitedSessions: boolean;
  canExportAsPDF: boolean;
  canExportAsDocx: boolean;
  canShareSessions: boolean;
  
  // Advanced AI features
  canUseAdvancedAI: boolean;
  
  // Admin capabilities
  canManageUsers: boolean;
  canAccessAnalytics: boolean;
  
  // Session limits
  sessionLimit: number;
  sessionCount: number;
  
  // Trial information
  trialDaysRemaining: number;
}

export function usePermissions(): Permissions {
  const { 
    isAdmin, 
    isPremium, 
    isTrial, 
    isTrialExpired, 
    userProfile 
  } = useAuth();
  
  const hasPremiumAccess = isAdmin || isPremium || (isTrial && !isTrialExpired);
  
  return {
    // Session management permissions
    canCreateUnlimitedSessions: hasPremiumAccess,
    canExportAsPDF: true, // Available to all
    canExportAsDocx: hasPremiumAccess,
    canShareSessions: hasPremiumAccess,
    
    // Advanced AI features
    canUseAdvancedAI: hasPremiumAccess,
    
    // Admin capabilities
    canManageUsers: isAdmin,
    canAccessAnalytics: isAdmin,
    
    // Session limits
    sessionLimit: userProfile?.maxSessions || 3,
    sessionCount: userProfile?.sessionCount || 0,
    
    // Trial information
    trialDaysRemaining: isTrial && userProfile?.trialEndDate ? 
      Math.max(0, Math.ceil((userProfile.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 
      0
  };
} 