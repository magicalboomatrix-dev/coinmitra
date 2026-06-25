import AdminShell from '../AdminShell';
import TransactionManager from '../TransactionManager';

export default function AdminWithdrawalsPage() {
  return (
    <AdminShell title="Withdrawal Approvals">
      <TransactionManager type="Withdraw" />
    </AdminShell>
  );
}
