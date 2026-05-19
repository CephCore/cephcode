export type BillingType = string;
export type SubscriptionType = 'pro' | 'max' | 'enterprise' | 'team';
export type RateLimitTier = string;

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
  subscriptionType: SubscriptionType | null;
  rateLimitTier: RateLimitTier | null;
  profile?: OAuthProfileResponse;
  tokenAccount?: {
    uuid: string;
    emailAddress: string;
    organizationUuid?: string;
  };
}

export interface OAuthTokenExchangeResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  account?: {
    uuid: string;
    email_address: string;
  };
  organization?: {
    uuid: string;
  };
}

export interface OAuthProfileResponse {
  account: {
    uuid: string;
    email: string;
    display_name?: string | null;
    created_at?: string;
  };
  organization: {
    uuid: string;
    organization_type?: string | null;
    rate_limit_tier?: RateLimitTier | null;
    has_extra_usage_enabled?: boolean | null;
    billing_type?: BillingType | null;
    subscription_created_at?: string | null;
  };
}

export type ReferralCampaign = 'claude_code_guest_pass' | string;

export interface ReferrerRewardInfo {
  currency: string;
  amount_minor_units: number;
}

export interface ReferralEligibilityResponse {
  eligible: boolean;
  referrer_reward?: ReferrerRewardInfo | null;
  remaining_passes?: number | null;
}

export interface ReferralRedemptionsResponse {
  [key: string]: any;
}

export interface UserRolesResponse {
  organization_role: string;
  workspace_role: string;
  organization_name: string;
}
