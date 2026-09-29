import { UserShell } from "@/components/shells/UserShell";
import { BbpsServiceCenter } from "@/components/bbps/BbpsServiceCenter";

const UserBills = () => {
  return (
    <UserShell title="Pay Bills">
      <div className="mx-auto max-w-4xl">
        <BbpsServiceCenter mode="customer" />
      </div>
    </UserShell>
  );
};

export default UserBills;
