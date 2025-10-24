import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, SegmentedButtons, TextInput, Dialog, Portal, HelperText, ActivityIndicator } from 'react-native-paper';
import { UseMethod } from '../composable/useMethod';

const StatusOptions = [
  { label: 'Pending', value: '1' },
  { label: 'Declined', value: '2' },
  // Approved users are moved to is_request=0; usually handled in Users page
  // { label: 'Approved', value: '0' },
];

export default function RequestRegistrationScreen() {
  const [status, setStatus] = useState('1');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await UseMethod('post', 'request-registration', { status });
      if (!res || res.status < 200 || res.status >= 300) {
        throw new Error(res?.data?.message || 'Failed to fetch registration requests');
      }
      const list = Array.isArray(res?.data) ? res.data : [];
      setRequests(list);
    } catch (e) {
      setError(e?.message || 'Failed to fetch registration requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  const approveUser = async (user) => {
    setActionMessage('');
    try {
      const res = await UseMethod('post', `approve-request/${user.id}`);
      if (!res || res.status < 200 || res.status >= 300) {
        throw new Error(res?.data?.message || 'Failed to approve user');
      }
      setActionMessage(`User ${user.name || user.username || user.email} approved successfully.`);
      setApproveDialogOpen(false);
      setSelectedUser(null);
      await loadRequests();
    } catch (e) {
      setActionMessage(e?.message || 'Failed to approve user');
    }
  };

  const openDeclineDialog = (user) => {
    setSelectedUser(user);
    setDeclineReason('');
    setDeclineDialogOpen(true);
  };

  const openApproveDialog = (user) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  const declineUser = async () => {
    if (!selectedUser || !declineReason) return;
    setActionMessage('');
    try {
      const res = await UseMethod('post', `decline-request/${selectedUser.id}`, { reason: declineReason });
      if (!res || res.status < 200 || res.status >= 300) {
        throw new Error(res?.data?.message || 'Failed to decline user');
      }
      setActionMessage(`User ${selectedUser.name || selectedUser.username || selectedUser.email} request declined.`);
      setDeclineDialogOpen(false);
      setDeclineReason('');
      setSelectedUser(null);
      await loadRequests();
    } catch (e) {
      setActionMessage(e?.message || 'Failed to decline user');
    }
  };

  const renderItem = ({ item }) => {
    const name = item?.name || `${item?.details?.first_name || ''} ${item?.details?.last_name || ''}`.trim();
    const email = item?.email || '';
    const roleName = item?.role?.name || 'Member';
    const statusText = item?.is_request === 1 ? 'Pending' : item?.is_request === 2 ? 'Declined' : 'Approved';

    return (
      <Card style={styles.card}>
        <Card.Title title={name || 'Unknown User'} subtitle={`${email} • ${roleName} • ${statusText}`} />
        <Card.Content>
          {/* Additional info could be shown here if needed */}
        </Card.Content>
        <Card.Actions>
          {item?.is_request === 1 ? (
            <>
              <Button mode="contained" onPress={() => openApproveDialog(item)} style={styles.approveBtn}>
                Approve
              </Button>
              <Button mode="outlined" onPress={() => openDeclineDialog(item)}>
                Decline
              </Button>
            </>
          ) : item?.is_request === 2 ? (
            <Text style={styles.declinedText}>Declined</Text>
          ) : (
            <Text style={styles.approvedText}>Approved</Text>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
       <SegmentedButtons
        value={status}
        onValueChange={setStatus}
        buttons={StatusOptions.map(opt => ({ value: opt.value, label: opt.label }))}
        style={styles.segment}
      />

      {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}
      {actionMessage ? <HelperText type="info" visible={!!actionMessage}>{actionMessage}</HelperText> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={<Text style={styles.empty}>No requests found.</Text>}
        />
      )}

      <Portal>
        <Dialog visible={declineDialogOpen} onDismiss={() => setDeclineDialogOpen(false)}>
          <Dialog.Title>Decline Registration Request</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Reason for Decline"
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
            />
            <HelperText type="error" visible={!declineReason}>Please provide a reason for declining</HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeclineDialogOpen(false)}>Cancel</Button>
            <Button onPress={declineUser} disabled={!declineReason}>
              Decline Request
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={approveDialogOpen} onDismiss={() => setApproveDialogOpen(false)}>
          <Dialog.Title>Confirm Approval</Dialog.Title>
          <Dialog.Content>
            <Text>
              Name: {selectedUser?.name || `${selectedUser?.details?.first_name || ''} ${selectedUser?.details?.last_name || ''}`.trim()}
            </Text>
            <Text>
              Role: {selectedUser?.role?.name || 'Member'}
            </Text>
            <Text>
              Account Group: {
                (Array.isArray(selectedUser?.accountType) && selectedUser?.accountType?.[0]?.account_group?.description)
                || selectedUser?.accountType?.account_group?.description
                || selectedUser?.group?.description
                || 'N/A'
              }
            </Text>
            <Text>
              Location: {selectedUser?.location?.name || 'N/A'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={() => approveUser(selectedUser)}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 8,
  },
  segment: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 10,
  },
  approveBtn: {
    marginRight: 8,
  },
  declinedText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  approvedText: {
    color: '#198754',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
  },
});