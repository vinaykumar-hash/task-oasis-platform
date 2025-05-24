
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore, User, UserRole } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Mail, Plus } from 'lucide-react';

// Mock members data
const mockMembers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'John Admin',
    role: 'admin',
    organizationId: 'org1',
    organizationName: 'TechCorp Inc'
  },
  {
    id: '2',
    email: 'manager@company.com',
    name: 'Sarah Manager',
    role: 'manager',
    organizationId: 'org1',
    organizationName: 'TechCorp Inc'
  },
  {
    id: '3',
    email: 'member@company.com',
    name: 'Mike Member',
    role: 'member',
    organizationId: 'org1',
    organizationName: 'TechCorp Inc'
  }
];

export const MemberManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member' as UserRole
  });

  if (!user) return null;

  const organizationMembers = mockMembers.filter(member => 
    member.organizationId === user.organizationId
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send an API request
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteData.email}`,
    });

    setInviteData({ email: '', role: 'member' });
    setShowInviteForm(false);
  };

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    // In a real app, this would update the member's role via API
    toast({
      title: "Role updated",
      description: "Member role has been updated successfully.",
    });
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove ${memberName} from the organization?`)) {
      // In a real app, this would remove the member via API
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the organization.`,
      });
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'member': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Organization Members</h3>
          <p className="text-sm text-gray-600">
            Manage your team members and their roles
          </p>
        </div>
        {user.role === 'admin' && (
          <Button onClick={() => setShowInviteForm(!showInviteForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {showInviteForm && user.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite New Member</CardTitle>
            <CardDescription>
              Send an invitation to join your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={inviteData.role} 
                    onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value as UserRole }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {organizationMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 rounded-full p-2">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleColor(member.role)}>
                    {member.role}
                  </Badge>
                  
                  {user.role === 'admin' && member.id !== user.id && (
                    <div className="flex space-x-2">
                      <Select 
                        value={member.role} 
                        onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.id, member.name)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Invitation System</h4>
              <p className="text-sm text-blue-700 mt-1">
                Share your organization ID <code className="bg-blue-100 px-1 rounded">{user.organizationId}</code> with new members to let them join during registration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
