import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import VoiceCall from "../components/VoiceCall";

function VoiceCallPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const user = searchParams.get("user");
  const target = searchParams.get("target");
  const caller = searchParams.get("caller");

  const targetUser = location.state?.targetUser;

  const targetName = targetUser?.name || target;

  const targetPhoto = targetUser?.photo || null;

  console.log("📞 Voice Call User:", user);
  console.log("📞 Voice Call Target:", target);
  console.log("📞 Caller:", caller);
  console.log("📞 Target Name:", targetName);

  if (!user || !target) {
    return <div>Invalid call information</div>;
  }

  return (
    <VoiceCall
      user={user}
      receiver={target}
      isCaller={true}
      onEnd={() => {
        window.location.href = "/messages";
      }}
    />
  );
}

export default VoiceCallPage;
