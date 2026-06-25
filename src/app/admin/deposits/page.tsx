import AdminShell from '../AdminShell';
import TransactionManager from '../TransactionManager';

export default function AdminDepositsPage() {
  return (
    <AdminShell title="Deposit Approvals">
      <TransactionManager type="Deposit" />
    </AdminShell>
  );
}
