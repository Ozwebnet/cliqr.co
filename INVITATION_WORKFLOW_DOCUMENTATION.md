# Enhanced Invitation Workflow Documentation

## 🔄 Overview

The Enhanced Invitation Workflow replaces the previous simple email invitation system with a comprehensive two-stage onboarding process that ensures complete account setup and proper data collection.

## 🧩 Workflow Architecture

### Stage 1: Invitation Sending
- **Manager Action**: Team manager sends invitation via enhanced dialogs
- **Email Delivery**: Secure invitation email with time-limited token
- **Database Record**: Creates record in `invitation_onboarding` table

### Stage 2: Invitee Form Completion
- **Form Access**: Invitee clicks secure link to access dynamic form
- **Role-Based Forms**: Different fields for clients vs team members
- **Data Validation**: Real-time validation with Australian business number checks
- **Form Submission**: Moves invitation to "Pending Manager Review" state

### Stage 3: Manager Review & Completion
- **Review Interface**: Manager reviews invitee's submitted information
- **Internal Fields**: Manager adds confidential/internal data
- **Account Creation**: System creates user account with combined data
- **Auto-Login**: New user can immediately access their account

## 📊 Database Schema

### Primary Table: `invitation_onboarding`
```sql
CREATE TABLE invitation_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
  team_id UUID REFERENCES teams(id),
  invited_by UUID REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending_invitee_response',
  
  -- Form data
  invitee_form_data JSONB,
  manager_form_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invitee_submitted_at TIMESTAMP WITH TIME ZONE,
  manager_reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Relationships
  reviewed_by UUID REFERENCES users(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Admin overrides
  admin_override BOOLEAN DEFAULT FALSE,
  admin_override_reason TEXT,
  
  -- Metadata
  metadata JSONB
);
```

### Supporting Table: `admin_action_logs`
```sql
CREATE TABLE admin_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  invitation_id UUID REFERENCES invitation_onboarding(id),
  admin_id UUID REFERENCES users(id),
  reason TEXT,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Invitation States

### Core States
- **`PENDING_INVITEE_RESPONSE`**: Waiting for invitee to complete form
- **`PENDING_MANAGER_REVIEW`**: Form submitted, awaiting manager review
- **`PENDING_MANAGER_COMPLETION`**: Manager reviewing, adding internal fields
- **`COMPLETED`**: Account created successfully
- **`EXPIRED`**: Invitation token expired
- **`CANCELLED`**: Invitation cancelled by manager

## 🔧 Key Components

### Frontend Components

#### 1. InvitationOnboardingForm
- **Location**: `src/components/Auth/InvitationOnboardingForm.jsx`
- **Purpose**: Dynamic form for invitees to complete their information
- **Features**:
  - Role-based field rendering
  - Real-time validation
  - Token validation
  - Australian business number validation

#### 2. InvitationReviewDialog
- **Location**: `src/components/CRM/InvitationReviewDialog.jsx`
- **Purpose**: Manager interface for reviewing and completing invitations
- **Features**:
  - Two-step review process
  - Internal field management
  - Password generation
  - Account finalization

#### 3. EnhancedPendingInvitesManager
- **Location**: `src/components/CRM/EnhancedPendingInvitesManager.jsx`
- **Purpose**: Dashboard widget for managing all pending invitations
- **Features**:
  - Status tracking
  - Review shortcuts
  - Bulk operations
  - Real-time updates

#### 4. InvitationSuccessPage
- **Location**: `src/components/Auth/InvitationSuccessPage.jsx`
- **Purpose**: Success page with auto-login functionality
- **Features**:
  - Account creation confirmation
  - Auto-login capability
  - Welcome messaging
  - Next steps guidance

### Backend Logic

#### 1. Enhanced Invitation Actions
- **Location**: `src/hooks/auth/enhancedInvitationActions.js`
- **Purpose**: Core invitation sending and management
- **Features**:
  - Secure token generation
  - Email integration
  - Fallback mechanisms
  - Validation helpers

#### 2. Invitation Schema
- **Location**: `src/lib/invitationSchema.js`
- **Purpose**: Database operations and state management
- **Features**:
  - CRUD operations
  - State transitions
  - Form field definitions
  - Token validation

#### 3. Admin Override Functions
- **Location**: `src/hooks/auth/adminInvitationOverrides.js`
- **Purpose**: Administrative override capabilities
- **Features**:
  - Force completion
  - Emergency cancellation
  - Expiry extension
  - Manual activation
  - Audit logging

## 🔐 Security Features

### Token Management
- **One-time use**: Tokens invalidated after successful use
- **Time-limited**: 72-hour default expiry
- **Cryptographically secure**: UUID + timestamp combination
- **Scope-limited**: Tied to specific invitation and role

### Data Protection
- **Field isolation**: Public vs internal field separation
- **Role-based access**: Different forms for different roles
- **Admin audit trail**: All override actions logged
- **Secure password generation**: Strong passwords auto-generated

### Permission Controls
- **Manager verification**: Only team managers can review
- **Admin overrides**: Full admin required for emergency actions
- **Team isolation**: Invitations scoped to team boundaries

## 🚀 Usage Examples

### Sending an Enhanced Invitation

```javascript
import { sendEnhancedInvitation } from '@/hooks/auth/enhancedInvitationActions';

const handleInvite = async () => {
  const result = await sendEnhancedInvitation(
    { email: 'newclient@example.com', role: 'client' },
    currentUser
  );
  
  if (result.success) {
    console.log('Invitation sent successfully');
  }
};
```

### Admin Override Operations

```javascript
import { adminOverrideInvitation } from '@/hooks/auth/adminInvitationOverrides';

// Force complete a stalled invitation
const forceComplete = async (invitationId) => {
  const result = await adminOverrideInvitation(
    invitationId,
    'force_complete',
    currentUser,
    {
      password: 'SecurePass123!',
      managerFormData: { /* internal fields */ },
      inviteeFormData: { /* public fields */ }
    }
  );
};

// Extend expired invitation
const extendInvitation = async (invitationId) => {
  const result = await adminOverrideInvitation(
    invitationId,
    'extend_expiry',
    currentUser,
    { extensionHours: 48 }
  );
};
```

## 📋 Role-Based Form Fields

### Client Fields

#### Public Fields (Completed by Invitee)
- `legal_first_name` - Legal first name
- `legal_middle_name` - Legal middle name (optional)
- `legal_last_name` - Legal last name
- `preferred_name` - Preferred name
- `phone_number` - Phone number
- `business_name` - Business/company name
- `position_job_title` - Position or job title
- `preferred_contact_method` - Contact method preference

#### Internal Fields (Completed by Manager)
- `internal_notes` - Internal notes about client
- `client_priority` - Priority level (low, medium, high, VIP)
- `assigned_manager_id` - Assigned manager
- `billing_rate` - Hourly billing rate
- `project_tags` - Project categorization tags

### Team Member Fields

#### Public Fields (Completed by Invitee)
- `legal_first_name` - Legal first name
- `legal_middle_name` - Legal middle name (optional)
- `legal_last_name` - Legal last name
- `preferred_name` - Preferred name
- `phone_number` - Phone number
- `employment_type` - Employment type (contractor, employee, intern)
- `portfolio_url` - Portfolio website
- `social_profiles` - Social media profiles
- `abn` - Australian Business Number (contractors)
- `acn` - Australian Company Number (if applicable)

#### Internal Fields (Completed by Manager)
- `skill_set` - Skills and expertise
- `hourly_rate` - Hourly rate
- `bank_account_name` - Bank account name
- `bsb_number` - BSB number
- `account_number` - Account number
- `permissions` - System permissions
- `internal_notes` - Internal notes

## 🔄 Migration from Legacy System

### Backward Compatibility
- Legacy invitation dialogs updated to use enhanced workflow
- Fallback email sending for old edge functions
- Graceful handling of existing pending invitations

### Transition Steps
1. **Database Migration**: Create new tables with proper schema
2. **Component Updates**: Replace old dialogs with enhanced versions
3. **Route Addition**: Add invitation form routes
4. **Testing**: Verify all workflows function correctly
5. **Cleanup**: Archive old invitation records

## 🛠️ Admin Tools

### Override Actions Available
- **Force Reset**: Completely reset invitation (new token)
- **Force Complete**: Skip workflow and create account directly
- **Emergency Cancel**: Immediately cancel invitation
- **Extend Expiry**: Add more time to invitation
- **Manual Activation**: Bypass invitation and create account

### Audit Trail
- All admin actions logged with timestamps
- Reason tracking for compliance
- User identification for accountability
- Metadata preservation for debugging

### Bulk Operations
- Select multiple invitations for bulk actions
- Consistent operation across multiple records
- Success/failure reporting
- Transaction safety

## 📈 Benefits of Enhanced Workflow

### For Team Managers
- **Complete Information**: All necessary data collected upfront
- **Review Control**: Ability to verify and add internal details
- **Security**: Proper credential management
- **Audit Trail**: Full visibility into invitation process

### For Invitees
- **Guided Process**: Clear step-by-step onboarding
- **Role-Appropriate**: Forms tailored to their specific role
- **Immediate Access**: Auto-login after completion
- **Professional Experience**: Polished, branded interface

### For System Administrators
- **Override Capabilities**: Handle edge cases and emergencies
- **Audit Logging**: Complete action history
- **Bulk Operations**: Efficient management at scale
- **Security Controls**: Token management and expiry

## 🔧 Configuration Options

### Token Settings
- **Expiry Duration**: Default 72 hours, configurable per invitation
- **Generation Method**: Crypto-secure UUID + timestamp
- **Validation Rules**: Role-based and team-scoped

### Email Integration
- **Primary Function**: `send-enhanced-invitation` edge function
- **Fallback**: Existing `admin-invite-user` function
- **Template Customization**: Role-based email content

### Form Validation
- **Australian Business Numbers**: Real-time ABN/ACN validation
- **Phone Numbers**: Australian format validation
- **Email Addresses**: Standard email validation
- **Required Fields**: Role-based requirement enforcement

This enhanced invitation workflow provides a robust, secure, and user-friendly onboarding experience that ensures complete data collection and proper account setup for all new team members and clients. 